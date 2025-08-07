import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").notNull().unique(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const financeLabels = pgTable("finance_labels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#1976D2"),
  emailCount: integer("email_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailFilters = pgTable("email_filters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  conditions: jsonb("conditions").notNull(), // {from: string[], subject: string[], hasAttachment: boolean}
  actions: jsonb("actions").notNull(), // {labelId: number, exportToDrive: boolean, saveAttachments: boolean}
  isActive: boolean("is_active").default(true),
  matchCount: integer("match_count").default(0),
  lastRun: timestamp("last_run"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const financialContacts = pgTable("financial_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  type: text("type").notNull(), // vendor, bank, utility, subscription
  emailCount: integer("email_count").default(0),
  lastEmailDate: timestamp("last_email_date"),
  isInGoogleContacts: boolean("is_in_google_contacts").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const financialEmails = pgTable("financial_emails", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gmailId: text("gmail_id").notNull().unique(),
  subject: text("subject").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  date: timestamp("date").notNull(),
  category: text("category"), // receipt, bill, invoice, statement, confirmation
  labelId: integer("label_id"),
  hasAttachments: boolean("has_attachments").default(false),
  attachmentCount: integer("attachment_count").default(0),
  isExported: boolean("is_exported").default(false),
  metadata: jsonb("metadata"), // additional email metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export const exportJobs = pgTable("export_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // metadata, pdf, attachments
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, failed
  itemCount: integer("item_count").default(0),
  filePath: text("file_path"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const batchJobs = pgTable("batch_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // bulk_sync, bulk_categorize, bulk_export, bulk_delete, bulk_label
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, failed, cancelled
  totalItems: integer("total_items").default(0),
  processedItems: integer("processed_items").default(0),
  successfulItems: integer("successful_items").default(0),
  failedItems: integer("failed_items").default(0),
  criteria: jsonb("criteria"), // selection criteria for bulk operations
  actions: jsonb("actions"), // actions to perform on selected items
  progress: integer("progress").default(0), // percentage 0-100
  errorDetails: jsonb("error_details"), // detailed error information
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const batchOperations = pgTable("batch_operations", {
  id: serial("id").primaryKey(),
  batchJobId: integer("batch_job_id").notNull(),
  itemId: integer("item_id").notNull(), // ID of the item being processed
  itemType: text("item_type").notNull(), // email, contact, label, filter
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  operation: text("operation").notNull(), // sync, categorize, export, delete, label
  result: jsonb("result"), // operation result data
  errorMessage: text("error_message"),
  processingTime: integer("processing_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertFinanceLabelSchema = createInsertSchema(financeLabels).omit({
  id: true,
  createdAt: true,
});

export const insertEmailFilterSchema = createInsertSchema(emailFilters).omit({
  id: true,
  createdAt: true,
  lastRun: true,
});

export const insertFinancialContactSchema = createInsertSchema(financialContacts).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialEmailSchema = createInsertSchema(financialEmails).omit({
  id: true,
  createdAt: true,
});

export const insertExportJobSchema = createInsertSchema(exportJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertBatchJobSchema = createInsertSchema(batchJobs).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertBatchOperationSchema = createInsertSchema(batchOperations).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FinanceLabel = typeof financeLabels.$inferSelect;
export type InsertFinanceLabel = z.infer<typeof insertFinanceLabelSchema>;

export type EmailFilter = typeof emailFilters.$inferSelect;
export type InsertEmailFilter = z.infer<typeof insertEmailFilterSchema>;

export type FinancialContact = typeof financialContacts.$inferSelect;
export type InsertFinancialContact = z.infer<typeof insertFinancialContactSchema>;

export type FinancialEmail = typeof financialEmails.$inferSelect;
export type InsertFinancialEmail = z.infer<typeof insertFinancialEmailSchema>;

export type ExportJob = typeof exportJobs.$inferSelect;
export type InsertExportJob = z.infer<typeof insertExportJobSchema>;

export type BatchJob = typeof batchJobs.$inferSelect;
export type InsertBatchJob = z.infer<typeof insertBatchJobSchema>;

export type BatchOperation = typeof batchOperations.$inferSelect;
export type InsertBatchOperation = z.infer<typeof insertBatchOperationSchema>;

// Bulk operation request schemas
export const bulkEmailOperationSchema = z.object({
  operation: z.enum(['categorize', 'label', 'export', 'delete', 'sync']),
  criteria: z.object({
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
    category: z.string().optional(),
    hasAttachments: z.boolean().optional(),
    fromDomains: z.array(z.string()).optional(),
    subjects: z.array(z.string()).optional(),
    labelIds: z.array(z.number()).optional(),
  }),
  actions: z.object({
    newCategory: z.string().optional(),
    newLabelId: z.number().optional(),
    exportType: z.enum(['metadata', 'pdf', 'attachments']).optional(),
    exportFormat: z.enum(['csv', 'json', 'xlsx']).optional(),
  }).optional(),
});

export const bulkContactOperationSchema = z.object({
  operation: z.enum(['merge', 'categorize', 'sync', 'delete']),
  criteria: z.object({
    types: z.array(z.string()).optional(),
    emailDomains: z.array(z.string()).optional(),
    lastEmailBefore: z.string().optional(),
    duplicateEmails: z.boolean().optional(),
  }),
  actions: z.object({
    newType: z.string().optional(),
    mergeIntoId: z.number().optional(),
  }).optional(),
});

export type BulkEmailOperation = z.infer<typeof bulkEmailOperationSchema>;
export type BulkContactOperation = z.infer<typeof bulkContactOperationSchema>;
