import {
  users,
  financialEmails,
  financialContacts,
  gmailLabels,
  emailFilters,
  batchJobs,
  type User,
  type UpsertUser,
  type FinancialEmail,
  type InsertFinancialEmailType,
  type FinancialContact,
  type InsertFinancialContactType,
  type GmailLabel,
  type InsertGmailLabelType,
  type EmailFilter,
  type InsertEmailFilterType,
  type BatchJob,
  type InsertBatchJobType,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Email operations
  createFinancialEmail(email: InsertFinancialEmailType): Promise<FinancialEmail>;
  getFinancialEmails(userId: string, limit?: number, offset?: number): Promise<FinancialEmail[]>;
  getFinancialEmailsByCategory(userId: string, category: string): Promise<FinancialEmail[]>;
  updateFinancialEmail(id: string, updates: Partial<FinancialEmail>): Promise<FinancialEmail>;
  deleteFinancialEmail(id: string): Promise<void>;
  getEmailStats(userId: string): Promise<{
    totalEmails: number;
    receipts: number;
    bills: number;
    statements: number;
    withAttachments: number;
  }>;
  
  // Contact operations
  upsertFinancialContact(contact: InsertFinancialContactType): Promise<FinancialContact>;
  getFinancialContacts(userId: string): Promise<FinancialContact[]>;
  updateContactEmailCount(userId: string, email: string): Promise<void>;
  
  // Gmail label operations
  createGmailLabel(label: InsertGmailLabelType): Promise<GmailLabel>;
  getGmailLabels(userId: string): Promise<GmailLabel[]>;
  deleteGmailLabel(id: string): Promise<void>;
  
  // Email filter operations
  createEmailFilter(filter: InsertEmailFilterType): Promise<EmailFilter>;
  getEmailFilters(userId: string): Promise<EmailFilter[]>;
  updateEmailFilter(id: string, updates: Partial<EmailFilter>): Promise<EmailFilter>;
  deleteEmailFilter(id: string): Promise<void>;
  
  // Batch job operations
  createBatchJob(job: InsertBatchJobType): Promise<BatchJob>;
  getBatchJobs(userId: string, limit?: number): Promise<BatchJob[]>;
  updateBatchJob(id: string, updates: Partial<BatchJob>): Promise<BatchJob>;
  getActiveBatchJobs(userId: string): Promise<BatchJob[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Email operations
  async createFinancialEmail(email: InsertFinancialEmailType): Promise<FinancialEmail> {
    const [created] = await db.insert(financialEmails).values(email).returning();
    return created;
  }

  async getFinancialEmails(userId: string, limit = 50, offset = 0): Promise<FinancialEmail[]> {
    return await db
      .select()
      .from(financialEmails)
      .where(eq(financialEmails.userId, userId))
      .orderBy(desc(financialEmails.dateReceived))
      .limit(limit)
      .offset(offset);
  }

  async getFinancialEmailsByCategory(userId: string, category: string): Promise<FinancialEmail[]> {
    return await db
      .select()
      .from(financialEmails)
      .where(and(
        eq(financialEmails.userId, userId),
        eq(financialEmails.category, category as any)
      ))
      .orderBy(desc(financialEmails.dateReceived));
  }

  async updateFinancialEmail(id: string, updates: Partial<FinancialEmail>): Promise<FinancialEmail> {
    const [updated] = await db
      .update(financialEmails)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(financialEmails.id, id))
      .returning();
    return updated;
  }

  async deleteFinancialEmail(id: string): Promise<void> {
    await db.delete(financialEmails).where(eq(financialEmails.id, id));
  }

  async getEmailStats(userId: string): Promise<{
    totalEmails: number;
    receipts: number;
    bills: number;
    statements: number;
    withAttachments: number;
  }> {
    const stats = await db
      .select({
        totalEmails: sql<number>`count(*)`,
        receipts: sql<number>`count(*) filter (where category = 'receipt')`,
        bills: sql<number>`count(*) filter (where category = 'bill')`,
        statements: sql<number>`count(*) filter (where category = 'statement')`,
        withAttachments: sql<number>`count(*) filter (where has_attachments = true)`,
      })
      .from(financialEmails)
      .where(eq(financialEmails.userId, userId));

    return stats[0] || {
      totalEmails: 0,
      receipts: 0,
      bills: 0,
      statements: 0,
      withAttachments: 0,
    };
  }

  // Contact operations
  async upsertFinancialContact(contact: InsertFinancialContactType): Promise<FinancialContact> {
    const [upserted] = await db
      .insert(financialContacts)
      .values(contact)
      .onConflictDoUpdate({
        target: [financialContacts.userId, financialContacts.email],
        set: {
          name: contact.name,
          domain: contact.domain,
          category: contact.category,
          lastEmailDate: contact.lastEmailDate,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upserted;
  }

  async getFinancialContacts(userId: string): Promise<FinancialContact[]> {
    return await db
      .select()
      .from(financialContacts)
      .where(eq(financialContacts.userId, userId))
      .orderBy(desc(financialContacts.lastEmailDate));
  }

  async updateContactEmailCount(userId: string, email: string): Promise<void> {
    await db
      .update(financialContacts)
      .set({
        emailCount: sql`email_count + 1`,
        lastEmailDate: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(financialContacts.userId, userId),
        eq(financialContacts.email, email)
      ));
  }

  // Gmail label operations
  async createGmailLabel(label: InsertGmailLabelType): Promise<GmailLabel> {
    const [created] = await db.insert(gmailLabels).values(label).returning();
    return created;
  }

  async getGmailLabels(userId: string): Promise<GmailLabel[]> {
    return await db
      .select()
      .from(gmailLabels)
      .where(eq(gmailLabels.userId, userId))
      .orderBy(gmailLabels.name);
  }

  async deleteGmailLabel(id: string): Promise<void> {
    await db.delete(gmailLabels).where(eq(gmailLabels.id, id));
  }

  // Email filter operations
  async createEmailFilter(filter: InsertEmailFilterType): Promise<EmailFilter> {
    const [created] = await db.insert(emailFilters).values(filter).returning();
    return created;
  }

  async getEmailFilters(userId: string): Promise<EmailFilter[]> {
    return await db
      .select()
      .from(emailFilters)
      .where(eq(emailFilters.userId, userId))
      .orderBy(emailFilters.priority, emailFilters.name);
  }

  async updateEmailFilter(id: string, updates: Partial<EmailFilter>): Promise<EmailFilter> {
    const [updated] = await db
      .update(emailFilters)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailFilters.id, id))
      .returning();
    return updated;
  }

  async deleteEmailFilter(id: string): Promise<void> {
    await db.delete(emailFilters).where(eq(emailFilters.id, id));
  }

  // Batch job operations
  async createBatchJob(job: InsertBatchJobType): Promise<BatchJob> {
    const [created] = await db.insert(batchJobs).values(job).returning();
    return created;
  }

  async getBatchJobs(userId: string, limit = 10): Promise<BatchJob[]> {
    return await db
      .select()
      .from(batchJobs)
      .where(eq(batchJobs.userId, userId))
      .orderBy(desc(batchJobs.createdAt))
      .limit(limit);
  }

  async updateBatchJob(id: string, updates: Partial<BatchJob>): Promise<BatchJob> {
    const [updated] = await db
      .update(batchJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(batchJobs.id, id))
      .returning();
    return updated;
  }

  async getActiveBatchJobs(userId: string): Promise<BatchJob[]> {
    return await db
      .select()
      .from(batchJobs)
      .where(and(
        eq(batchJobs.userId, userId),
        inArray(batchJobs.status, ['pending', 'running'])
      ))
      .orderBy(desc(batchJobs.createdAt));
  }
}

export const storage = new DatabaseStorage();
