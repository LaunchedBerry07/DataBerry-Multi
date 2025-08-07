import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  googleId: varchar("google_id").unique(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email categories enum
export const emailCategoryEnum = pgEnum("email_category", [
  "receipt",
  "bill", 
  "statement",
  "confirmation",
  "invoice",
  "other"
]);

// Batch job status enum
export const batchJobStatusEnum = pgEnum("batch_job_status", [
  "pending",
  "running", 
  "completed",
  "failed",
  "cancelled"
]);

// Financial emails table
export const financialEmails = pgTable("financial_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gmailId: varchar("gmail_id").notNull(),
  threadId: varchar("thread_id"),
  subject: text("subject").notNull(),
  fromEmail: varchar("from_email").notNull(),
  fromName: varchar("from_name"),
  category: emailCategoryEnum("category").default("other"),
  dateReceived: timestamp("date_received").notNull(),
  hasAttachments: boolean("has_attachments").default(false),
  attachmentCount: integer("attachment_count").default(0),
  isProcessed: boolean("is_processed").default(false),
  labels: text("labels").array(),
  snippet: text("snippet"),
  bodyPlain: text("body_plain"),
  bodyHtml: text("body_html"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial contacts table
export const financialContacts = pgTable("financial_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  email: varchar("email").notNull(),
  name: varchar("name"),
  domain: varchar("domain"),
  category: emailCategoryEnum("category").default("other"),
  emailCount: integer("email_count").default(0),
  lastEmailDate: timestamp("last_email_date"),
  isBlocked: boolean("is_blocked").default(false),
  customLabels: text("custom_labels").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gmail labels table
export const gmailLabels = pgTable("gmail_labels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  labelId: varchar("label_id").notNull(),
  name: varchar("name").notNull(),
  color: varchar("color"),
  isCustom: boolean("is_custom").default(false),
  messageListVisibility: varchar("message_list_visibility"),
  labelListVisibility: varchar("label_list_visibility"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email filters table
export const emailFilters = pgTable("email_filters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  conditions: jsonb("conditions").notNull(),
  actions: jsonb("actions").notNull(),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Batch jobs table
export const batchJobs = pgTable("batch_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'label', 'export', 'filter', etc.
  name: varchar("name").notNull(),
  status: batchJobStatusEnum("status").default("pending"),
  progress: integer("progress").default(0),
  total: integer("total").default(0),
  parameters: jsonb("parameters"),
  result: jsonb("result"),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  emails: many(financialEmails),
  contacts: many(financialContacts),
  labels: many(gmailLabels),
  filters: many(emailFilters),
  batchJobs: many(batchJobs),
}));

export const financialEmailsRelations = relations(financialEmails, ({ one }) => ({
  user: one(users, {
    fields: [financialEmails.userId],
    references: [users.id],
  }),
}));

export const financialContactsRelations = relations(financialContacts, ({ one }) => ({
  user: one(users, {
    fields: [financialContacts.userId],
    references: [users.id],
  }),
}));

export const gmailLabelsRelations = relations(gmailLabels, ({ one }) => ({
  user: one(users, {
    fields: [gmailLabels.userId],
    references: [users.id],
  }),
}));

export const emailFiltersRelations = relations(emailFilters, ({ one }) => ({
  user: one(users, {
    fields: [emailFilters.userId],
    references: [users.id],
  }),
}));

export const batchJobsRelations = relations(batchJobs, ({ one }) => ({
  user: one(users, {
    fields: [batchJobs.userId],
    references: [users.id],
  }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertFinancialEmail = typeof financialEmails.$inferInsert;
export type FinancialEmail = typeof financialEmails.$inferSelect;

export type InsertFinancialContact = typeof financialContacts.$inferInsert;
export type FinancialContact = typeof financialContacts.$inferSelect;

export type InsertGmailLabel = typeof gmailLabels.$inferInsert;
export type GmailLabel = typeof gmailLabels.$inferSelect;

export type InsertEmailFilter = typeof emailFilters.$inferInsert;
export type EmailFilter = typeof emailFilters.$inferSelect;

export type InsertBatchJob = typeof batchJobs.$inferInsert;
export type BatchJob = typeof batchJobs.$inferSelect;

// Zod schemas
export const insertFinancialEmailSchema = createInsertSchema(financialEmails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinancialContactSchema = createInsertSchema(financialContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGmailLabelSchema = createInsertSchema(gmailLabels).omit({
  id: true,
  createdAt: true,
});

export const insertEmailFilterSchema = createInsertSchema(emailFilters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBatchJobSchema = createInsertSchema(batchJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFinancialEmailType = z.infer<typeof insertFinancialEmailSchema>;
export type InsertFinancialContactType = z.infer<typeof insertFinancialContactSchema>;
export type InsertGmailLabelType = z.infer<typeof insertGmailLabelSchema>;
export type InsertEmailFilterType = z.infer<typeof insertEmailFilterSchema>;
export type InsertBatchJobType = z.infer<typeof insertBatchJobSchema>;
