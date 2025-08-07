import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: any;
  internalDate: string;
  labelIds?: string[];
}

interface ParsedEmail {
  id: string;
  threadId: string;
  subject: string;
  fromEmail: string;
  fromName: string;
  dateReceived: Date;
  hasAttachments: boolean;
  attachmentCount: number;
  labels: string[];
  snippet: string;
  bodyPlain?: string;
  bodyHtml?: string;
}

interface GmailLabel {
  id: string;
  name: string;
  messageListVisibility: string;
  labelListVisibility: string;
  color?: {
    backgroundColor?: string;
    textColor?: string;
  };
}

export class GmailAPIService {
  private gmail: any;
  private oauth2Client: OAuth2Client;

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async getEmails(query: string = '', maxResults: number = 50): Promise<ParsedEmail[]> {
    try {
      // Get message IDs
      const listResponse = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      if (!listResponse.data.messages) {
        return [];
      }

      // Get full message details
      const messages = await Promise.all(
        listResponse.data.messages.map(async (message: { id: string }) => {
          const msgResponse = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
          });
          return msgResponse.data;
        })
      );

      return messages.map((message: GmailMessage) => this.parseEmail(message));
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error(`Failed to fetch emails: ${error}`);
    }
  }

  async getFinancialEmails(maxResults: number = 100): Promise<ParsedEmail[]> {
    const financialQueries = [
      'from:(amazon.com OR paypal.com OR stripe.com OR square.com)',
      'subject:(receipt OR invoice OR bill OR statement OR payment)',
      'from:billing OR from:noreply OR from:receipts',
      'has:attachment (receipt OR invoice OR statement)',
    ];

    const allEmails: ParsedEmail[] = [];

    for (const query of financialQueries) {
      try {
        const emails = await this.getEmails(query, Math.floor(maxResults / financialQueries.length));
        allEmails.push(...emails);
      } catch (error) {
        console.warn(`Failed to fetch emails for query "${query}":`, error);
      }
    }

    // Remove duplicates by ID
    const uniqueEmails = allEmails.filter((email, index, self) =>
      index === self.findIndex(e => e.id === email.id)
    );

    return uniqueEmails.slice(0, maxResults);
  }

  async createLabel(name: string, color?: string): Promise<GmailLabel> {
    try {
      const response = await this.gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
          color: color ? {
            backgroundColor: color,
            textColor: '#ffffff'
          } : undefined,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating label:', error);
      throw new Error(`Failed to create label: ${error}`);
    }
  }

  async getLabels(): Promise<GmailLabel[]> {
    try {
      const response = await this.gmail.users.labels.list({
        userId: 'me',
      });

      return response.data.labels || [];
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw new Error(`Failed to fetch labels: ${error}`);
    }
  }

  async addLabelToEmails(emailIds: string[], labelId: string): Promise<void> {
    try {
      await Promise.all(
        emailIds.map(async (emailId) => {
          await this.gmail.users.messages.modify({
            userId: 'me',
            id: emailId,
            requestBody: {
              addLabelIds: [labelId],
            },
          });
        })
      );
    } catch (error) {
      console.error('Error adding labels to emails:', error);
      throw new Error(`Failed to add labels to emails: ${error}`);
    }
  }

  private parseEmail(message: GmailMessage): ParsedEmail {
    const headers = message.payload?.headers || [];
    const subject = this.getHeader(headers, 'Subject') || 'No Subject';
    const fromHeader = this.getHeader(headers, 'From') || '';
    const dateHeader = this.getHeader(headers, 'Date') || message.internalDate;

    // Parse from header
    const fromMatch = fromHeader.match(/^(.*?)\s*<(.+?)>$/) || fromHeader.match(/^(.+)$/);
    const fromName = fromMatch?.[1]?.trim().replace(/"/g, '') || '';
    const fromEmail = fromMatch?.[2]?.trim() || fromMatch?.[1]?.trim() || '';

    // Parse date
    const dateReceived = dateHeader 
      ? new Date(dateHeader)
      : new Date(parseInt(message.internalDate));

    // Check for attachments
    const hasAttachments = this.hasAttachments(message.payload);
    const attachmentCount = this.getAttachmentCount(message.payload);

    // Get body content
    const { bodyPlain, bodyHtml } = this.extractBody(message.payload);

    // Categorize email
    const category = this.categorizeEmail(subject, fromEmail, bodyPlain || '');

    return {
      id: message.id,
      threadId: message.threadId,
      subject,
      fromEmail,
      fromName,
      dateReceived,
      hasAttachments,
      attachmentCount,
      labels: message.labelIds || [],
      snippet: message.snippet || '',
      bodyPlain,
      bodyHtml,
    };
  }

  private getHeader(headers: any[], name: string): string | undefined {
    const header = headers.find((h: any) => h.name === name);
    return header?.value;
  }

  private hasAttachments(payload: any): boolean {
    if (!payload) return false;

    if (payload.parts) {
      return payload.parts.some((part: any) => 
        part.filename || this.hasAttachments(part)
      );
    }

    return !!payload.filename;
  }

  private getAttachmentCount(payload: any): number {
    if (!payload) return 0;

    let count = 0;

    if (payload.filename) {
      count++;
    }

    if (payload.parts) {
      count += payload.parts.reduce((acc: number, part: any) => 
        acc + this.getAttachmentCount(part), 0
      );
    }

    return count;
  }

  private extractBody(payload: any): { bodyPlain?: string; bodyHtml?: string } {
    if (!payload) return {};

    let bodyPlain = '';
    let bodyHtml = '';

    if (payload.body?.data) {
      const mimeType = payload.mimeType;
      const data = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      
      if (mimeType === 'text/plain') {
        bodyPlain = data;
      } else if (mimeType === 'text/html') {
        bodyHtml = data;
      }
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        const { bodyPlain: partPlain, bodyHtml: partHtml } = this.extractBody(part);
        if (partPlain) bodyPlain += partPlain;
        if (partHtml) bodyHtml += partHtml;
      }
    }

    return { 
      bodyPlain: bodyPlain || undefined, 
      bodyHtml: bodyHtml || undefined 
    };
  }

  private categorizeEmail(subject: string, fromEmail: string, body: string): string {
    const text = (subject + ' ' + fromEmail + ' ' + body).toLowerCase();

    if (text.includes('receipt') || text.includes('your order') || text.includes('purchase confirmation')) {
      return 'receipt';
    }
    if (text.includes('bill') || text.includes('invoice') || text.includes('payment due')) {
      return 'bill';
    }
    if (text.includes('statement') || text.includes('monthly summary') || text.includes('account summary')) {
      return 'statement';
    }
    if (text.includes('payment confirmation') || text.includes('transaction') || text.includes('successful payment')) {
      return 'confirmation';
    }
    if (text.includes('invoice') || text.includes('billing')) {
      return 'invoice';
    }

    return 'other';
  }
}
