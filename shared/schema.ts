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
