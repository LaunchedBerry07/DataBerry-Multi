import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertFinanceLabelSchema, 
  insertEmailFilterSchema,
  insertFinancialContactSchema,
  insertFinancialEmailSchema,
  insertExportJobSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
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

  const httpServer = createServer(app);
  return httpServer;
}
