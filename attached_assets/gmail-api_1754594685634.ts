interface GmailAuthResponse {
  access_token: string;
  refresh_token?: string;
  email: string;
  id: string;
}

export class GmailAPI {
  private static instance: GmailAPI;
  private accessToken: string | null = null;
  private clientId: string;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "";
  }

  static getInstance(): GmailAPI {
    if (!GmailAPI.instance) {
      GmailAPI.instance = new GmailAPI();
    }
    return GmailAPI.instance;
  }

  async authenticate(): Promise<GmailAuthResponse> {
    if (!this.clientId) {
      throw new Error("Google Client ID not configured");
    }

    try {
      // Load Google Identity Services
      await this.loadGoogleIdentityServices();
      
      return new Promise((resolve, reject) => {
        window.google?.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/contacts',
          callback: async (tokenResponse: any) => {
            try {
              this.accessToken = tokenResponse.access_token;
              const userInfo = await this.getUserInfo();
              resolve({
                access_token: tokenResponse.access_token,
                refresh_token: tokenResponse.refresh_token,
                email: userInfo.email,
                id: userInfo.id
              });
            } catch (error) {
              reject(error);
            }
          },
          error_callback: (error: any) => {
            reject(new Error(`OAuth error: ${error.error}`));
          }
        }).requestAccessToken();
      });
    } catch (error) {
      throw new Error(`Authentication failed: ${error}`);
    }
  }

  private async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  private async getUserInfo(): Promise<{ email: string; id: string }> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  async getEmails(query: string = '', maxResults: number = 50): Promise<any[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      // First, get message IDs
      const listResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!listResponse.ok) {
        throw new Error('Failed to fetch emails');
      }

      const listData = await listResponse.json();
      
      if (!listData.messages) {
        return [];
      }

      // Get full message details
      const emails = await Promise.all(
        listData.messages.map(async (message: { id: string }) => {
          const msgResponse = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`
              }
            }
          );
          return msgResponse.json();
        })
      );

      return emails;
    } catch (error) {
      throw new Error(`Failed to fetch emails: ${error}`);
    }
  }

  async createLabel(name: string, color: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/labels', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
        color: {
          backgroundColor: color,
          textColor: '#ffffff'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create label');
    }

    return response.json();
  }

  async exportEmailToPDF(messageId: string): Promise<Blob> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    // This would implement email to PDF conversion
    // For now, return a placeholder
    return new Blob(['PDF content'], { type: 'application/pdf' });
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }
}

declare global {
  interface Window {
    google?: any;
  }
}
