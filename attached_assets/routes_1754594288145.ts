import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertFinanceLabelSchema, 
  insertEmailFilterSchema,
  insertFinancialContactSchema,
  insertFinancialEmailSchema,
  insertExportJobSchema,
  bulkEmailOperationSchema,
  bulkContactOperationSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check endpoint for Google Cloud
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Readiness check endpoint for Google Cloud
  app.get("/api/ready", (req, res) => {
    res.status(200).json({ status: "ready", timestamp: new Date().toISOString() });
  });

  // Gmail OAuth routes
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { email, googleId, accessToken, refreshToken } = req.body;
      
      let user = await storage.getUserByGoogleId(googleId);
      if (user) {
        // Update tokens
        user = await storage.updateUser(user.id, { accessToken, refreshToken });
      } else {
        // Create new user
        user = await storage.createUser({ email, googleId, accessToken, refreshToken });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Finance labels routes
  app.get("/api/users/:userId/labels", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const labels = await storage.getFinanceLabels(userId);
      res.json(labels);
    } catch (error) {
      res.status(500).json({ message: "Failed to get labels" });
    }
  });

  app.post("/api/users/:userId/labels", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const labelData = insertFinanceLabelSchema.parse({ ...req.body, userId });
      const label = await storage.createFinanceLabel(labelData);
      res.json(label);
    } catch (error) {
      res.status(400).json({ message: "Invalid label data" });
    }
  });

  app.put("/api/labels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const label = await storage.updateFinanceLabel(id, updates);
      if (!label) {
        return res.status(404).json({ message: "Label not found" });
      }
      res.json(label);
    } catch (error) {
      res.status(500).json({ message: "Failed to update label" });
    }
  });

  app.delete("/api/labels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFinanceLabel(id);
      if (!deleted) {
        return res.status(404).json({ message: "Label not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete label" });
    }
  });

  // Email filters routes
  app.get("/api/users/:userId/filters", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const filters = await storage.getEmailFilters(userId);
      res.json(filters);
    } catch (error) {
      res.status(500).json({ message: "Failed to get filters" });
    }
  });

  app.post("/api/users/:userId/filters", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const filterData = insertEmailFilterSchema.parse({ ...req.body, userId });
      const filter = await storage.createEmailFilter(filterData);
      res.json(filter);
    } catch (error) {
      res.status(400).json({ message: "Invalid filter data" });
    }
  });

  app.put("/api/filters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const filter = await storage.updateEmailFilter(id, updates);
      if (!filter) {
        return res.status(404).json({ message: "Filter not found" });
      }
      res.json(filter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update filter" });
    }
  });

  app.delete("/api/filters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmailFilter(id);
      if (!deleted) {
        return res.status(404).json({ message: "Filter not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete filter" });
    }
  });

  // Financial contacts routes
  app.get("/api/users/:userId/contacts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const contacts = await storage.getFinancialContacts(userId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get contacts" });
    }
  });

  app.post("/api/users/:userId/contacts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const contactData = insertFinancialContactSchema.parse({ ...req.body, userId });
      const contact = await storage.createFinancialContact(contactData);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact data" });
    }
  });

  // Financial emails routes
  app.get("/api/users/:userId/emails", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const category = req.query.category as string | undefined;
      const emails = await storage.getFinancialEmails(userId, category);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: "Failed to get emails" });
    }
  });

  app.post("/api/users/:userId/emails", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const emailData = insertFinancialEmailSchema.parse({ ...req.body, userId });
      const email = await storage.createFinancialEmail(emailData);
      res.json(email);
    } catch (error) {
      res.status(400).json({ message: "Invalid email data" });
    }
  });

  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getEmailStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Export jobs routes
  app.get("/api/users/:userId/exports", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const exports = await storage.getExportJobs(userId);
      res.json(exports);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exports" });
    }
  });

  app.post("/api/users/:userId/exports", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const exportData = insertExportJobSchema.parse({ ...req.body, userId });
      const exportJob = await storage.createExportJob(exportData);
      res.json(exportJob);
    } catch (error) {
      res.status(400).json({ message: "Invalid export data" });
    }
  });

  // Gmail sync route
  app.post("/api/users/:userId/sync", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      // This would implement actual Gmail API sync
      res.json({ message: "Sync completed", timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ message: "Sync failed" });
    }
  });

  // Batch jobs routes
  app.get("/api/users/:userId/batch-jobs", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const jobs = await storage.getBatchJobs(userId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get batch jobs" });
    }
  });

  app.get("/api/batch-jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getBatchJob(id);
      if (!job) {
        return res.status(404).json({ message: "Batch job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to get batch job" });
    }
  });

  app.get("/api/batch-jobs/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const status = await storage.getBulkOperationStatus(id);
      if (!status) {
        return res.status(404).json({ message: "Batch job not found" });
      }
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get batch job status" });
    }
  });

  app.post("/api/batch-jobs/:id/cancel", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cancelled = await storage.cancelBatchJob(id);
      if (!cancelled) {
        return res.status(400).json({ message: "Cannot cancel batch job" });
      }
      res.json({ success: true, message: "Batch job cancelled" });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel batch job" });
    }
  });

  app.get("/api/batch-jobs/:id/operations", async (req, res) => {
    try {
      const batchJobId = parseInt(req.params.id);
      const operations = await storage.getBatchOperations(batchJobId);
      res.json(operations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get batch operations" });
    }
  });

  // Bulk operations routes
  app.post("/api/users/:userId/bulk/emails", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const operation = bulkEmailOperationSchema.parse(req.body);
      const batchJob = await storage.processBulkEmailOperation(userId, operation);
      res.json(batchJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid operation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to start bulk email operation" });
    }
  });

  app.post("/api/users/:userId/bulk/contacts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const operation = bulkContactOperationSchema.parse(req.body);
      const batchJob = await storage.processBulkContactOperation(userId, operation);
      res.json(batchJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid operation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to start bulk contact operation" });
    }
  });

  // Bulk operations examples and templates
  app.get("/api/bulk/templates/emails", async (req, res) => {
    try {
      const templates = {
        categorizeReceipts: {
          operation: "categorize",
          criteria: {
            category: "receipt",
            dateRange: {
              start: "2024-01-01",
              end: "2024-12-31"
            }
          },
          actions: {
            newCategory: "receipt"
          }
        },
        labelByDomain: {
          operation: "label",
          criteria: {
            fromDomains: ["amazon.com", "paypal.com"]
          },
          actions: {
            newLabelId: 1
          }
        },
        exportAttachments: {
          operation: "export",
          criteria: {
            hasAttachments: true,
            category: "bill"
          },
          actions: {
            exportType: "attachments",
            exportFormat: "pdf"
          }
        }
      };
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get email templates" });
    }
  });

  app.get("/api/bulk/templates/contacts", async (req, res) => {
    try {
      const templates = {
        categorizeVendors: {
          operation: "categorize",
          criteria: {
            types: ["vendor"]
          },
          actions: {
            newType: "vendor"
          }
        },
        cleanupOldContacts: {
          operation: "delete",
          criteria: {
            lastEmailBefore: "2023-01-01"
          }
        }
      };
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get contact templates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
