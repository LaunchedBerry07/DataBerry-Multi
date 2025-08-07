import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { GmailAPIService } from "./services/gmail-api";
import { insertFinancialEmailSchema, insertBatchJobSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Gmail sync endpoint
  app.post('/api/gmail/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.accessToken) {
        return res.status(400).json({ message: "Gmail access token not found" });
      }

      const gmailService = new GmailAPIService(user.accessToken, user.refreshToken);
      const emails = await gmailService.getFinancialEmails(100);

      let processedCount = 0;
      const errors: string[] = [];

      for (const email of emails) {
        try {
          await storage.createFinancialEmail({
            userId,
            gmailId: email.id,
            threadId: email.threadId,
            subject: email.subject,
            fromEmail: email.fromEmail,
            fromName: email.fromName,
            category: email.bodyPlain?.toLowerCase().includes('receipt') ? 'receipt' : 'other' as any,
            dateReceived: email.dateReceived,
            hasAttachments: email.hasAttachments,
            attachmentCount: email.attachmentCount,
            labels: email.labels,
            snippet: email.snippet,
            bodyPlain: email.bodyPlain,
            bodyHtml: email.bodyHtml,
          });

          // Upsert contact
          const domain = email.fromEmail.split('@')[1];
          await storage.upsertFinancialContact({
            userId,
            email: email.fromEmail,
            name: email.fromName,
            domain,
            category: 'other' as any,
            lastEmailDate: email.dateReceived,
            emailCount: 1,
          });

          processedCount++;
        } catch (error) {
          console.warn(`Failed to process email ${email.id}:`, error);
          errors.push(`Failed to process email ${email.id}`);
        }
      }

      res.json({
        success: true,
        processed: processedCount,
        total: emails.length,
        errors,
      });
    } catch (error) {
      console.error("Gmail sync error:", error);
      res.status(500).json({ message: "Failed to sync Gmail emails" });
    }
  });

  // Financial emails endpoints
  app.get('/api/emails', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { limit = 50, offset = 0, category } = req.query;

      let emails;
      if (category && category !== 'all') {
        emails = await storage.getFinancialEmailsByCategory(userId, category);
      } else {
        emails = await storage.getFinancialEmails(userId, parseInt(limit), parseInt(offset));
      }

      res.json(emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).json({ message: "Failed to fetch emails" });
    }
  });

  app.get('/api/emails/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getEmailStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching email stats:", error);
      res.status(500).json({ message: "Failed to fetch email stats" });
    }
  });

  // Contacts endpoints
  app.get('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getFinancialContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // Labels endpoints
  app.get('/api/labels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.accessToken) {
        return res.status(400).json({ message: "Gmail access token not found" });
      }

      const gmailService = new GmailAPIService(user.accessToken, user.refreshToken);
      const labels = await gmailService.getLabels();
      
      res.json(labels);
    } catch (error) {
      console.error("Error fetching labels:", error);
      res.status(500).json({ message: "Failed to fetch labels" });
    }
  });

  app.post('/api/labels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, color } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user?.accessToken) {
        return res.status(400).json({ message: "Gmail access token not found" });
      }

      const gmailService = new GmailAPIService(user.accessToken, user.refreshToken);
      const label = await gmailService.createLabel(name, color);
      
      // Store in database
      await storage.createGmailLabel({
        userId,
        labelId: label.id,
        name: label.name,
        color,
        isCustom: true,
        messageListVisibility: label.messageListVisibility,
        labelListVisibility: label.labelListVisibility,
      });

      res.json(label);
    } catch (error) {
      console.error("Error creating label:", error);
      res.status(500).json({ message: "Failed to create label" });
    }
  });

  // Email filters endpoints
  app.get('/api/filters', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const filters = await storage.getEmailFilters(userId);
      res.json(filters);
    } catch (error) {
      console.error("Error fetching filters:", error);
      res.status(500).json({ message: "Failed to fetch filters" });
    }
  });

  // Batch operations endpoints
  app.get('/api/batch-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { active } = req.query;
      
      let jobs;
      if (active === 'true') {
        jobs = await storage.getActiveBatchJobs(userId);
      } else {
        jobs = await storage.getBatchJobs(userId, 20);
      }
      
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching batch jobs:", error);
      res.status(500).json({ message: "Failed to fetch batch jobs" });
    }
  });

  app.post('/api/batch-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobData = insertBatchJobSchema.parse({
        ...req.body,
        userId,
      });

      const job = await storage.createBatchJob(jobData);
      
      // Start background processing
      processBatchJob(job.id);
      
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      console.error("Error creating batch job:", error);
      res.status(500).json({ message: "Failed to create batch job" });
    }
  });

  // Bulk operations
  app.post('/api/emails/bulk-label', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { emailIds, labelId } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user?.accessToken) {
        return res.status(400).json({ message: "Gmail access token not found" });
      }

      const gmailService = new GmailAPIService(user.accessToken, user.refreshToken);
      await gmailService.addLabelToEmails(emailIds, labelId);
      
      res.json({ success: true, processed: emailIds.length });
    } catch (error) {
      console.error("Error bulk labeling emails:", error);
      res.status(500).json({ message: "Failed to bulk label emails" });
    }
  });

  // Export endpoints
  app.post('/api/export/sheets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category, dateRange } = req.body;
      
      // Create batch job for export
      const job = await storage.createBatchJob({
        userId,
        type: 'export',
        name: 'Export to Google Sheets',
        status: 'pending',
        progress: 0,
        total: 1,
        parameters: { category, dateRange, format: 'sheets' },
      });

      // Start background processing
      processBatchJob(job.id);
      
      res.json(job);
    } catch (error) {
      console.error("Error starting export:", error);
      res.status(500).json({ message: "Failed to start export" });
    }
  });

  // Background job processing (simplified)
  async function processBatchJob(jobId: string) {
    try {
      const job = await storage.updateBatchJob(jobId, {
        status: 'running',
        startedAt: new Date(),
        progress: 0,
      });

      // Simulate processing with progress updates
      const progressSteps = [25, 50, 75, 100];
      for (const progress of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await storage.updateBatchJob(jobId, { progress });
      }

      await storage.updateBatchJob(jobId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        result: { message: 'Processing completed successfully' },
      });
    } catch (error) {
      await storage.updateBatchJob(jobId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
