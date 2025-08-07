import { 
  users, 
  financeLabels, 
  emailFilters, 
  financialContacts, 
  financialEmails, 
  exportJobs,
  type User, 
  type InsertUser,
  type FinanceLabel,
  type InsertFinanceLabel,
  type EmailFilter,
  type InsertEmailFilter,
  type FinancialContact,
  type InsertFinancialContact,
  type FinancialEmail,
  type InsertFinancialEmail,
  type ExportJob,
  type InsertExportJob
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Finance labels
  getFinanceLabels(userId: number): Promise<FinanceLabel[]>;
  createFinanceLabel(label: InsertFinanceLabel): Promise<FinanceLabel>;
  updateFinanceLabel(id: number, updates: Partial<FinanceLabel>): Promise<FinanceLabel | undefined>;
  deleteFinanceLabel(id: number): Promise<boolean>;

  // Email filters
  getEmailFilters(userId: number): Promise<EmailFilter[]>;
  createEmailFilter(filter: InsertEmailFilter): Promise<EmailFilter>;
  updateEmailFilter(id: number, updates: Partial<EmailFilter>): Promise<EmailFilter | undefined>;
  deleteEmailFilter(id: number): Promise<boolean>;

  // Financial contacts
  getFinancialContacts(userId: number): Promise<FinancialContact[]>;
  createFinancialContact(contact: InsertFinancialContact): Promise<FinancialContact>;
  updateFinancialContact(id: number, updates: Partial<FinancialContact>): Promise<FinancialContact | undefined>;

  // Financial emails
  getFinancialEmails(userId: number, category?: string): Promise<FinancialEmail[]>;
  createFinancialEmail(email: InsertFinancialEmail): Promise<FinancialEmail>;
  getEmailStats(userId: number): Promise<{totalEmails: number, receipts: number, bills: number, statements: number}>;

  // Export jobs
  getExportJobs(userId: number): Promise<ExportJob[]>;
  createExportJob(job: InsertExportJob): Promise<ExportJob>;
  updateExportJob(id: number, updates: Partial<ExportJob>): Promise<ExportJob | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private financeLabels: Map<number, FinanceLabel> = new Map();
  private emailFilters: Map<number, EmailFilter> = new Map();
  private financialContacts: Map<number, FinancialContact> = new Map();
  private financialEmails: Map<number, FinancialEmail> = new Map();
  private exportJobs: Map<number, ExportJob> = new Map();
  private currentId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getFinanceLabels(userId: number): Promise<FinanceLabel[]> {
    return Array.from(this.financeLabels.values()).filter(label => label.userId === userId);
  }

  async createFinanceLabel(insertLabel: InsertFinanceLabel): Promise<FinanceLabel> {
    const id = this.currentId++;
    const label: FinanceLabel = {
      ...insertLabel,
      id,
      createdAt: new Date()
    };
    this.financeLabels.set(id, label);
    return label;
  }

  async updateFinanceLabel(id: number, updates: Partial<FinanceLabel>): Promise<FinanceLabel | undefined> {
    const label = this.financeLabels.get(id);
    if (!label) return undefined;
    
    const updatedLabel = { ...label, ...updates };
    this.financeLabels.set(id, updatedLabel);
    return updatedLabel;
  }

  async deleteFinanceLabel(id: number): Promise<boolean> {
    return this.financeLabels.delete(id);
  }

  async getEmailFilters(userId: number): Promise<EmailFilter[]> {
    return Array.from(this.emailFilters.values()).filter(filter => filter.userId === userId);
  }

  async createEmailFilter(insertFilter: InsertEmailFilter): Promise<EmailFilter> {
    const id = this.currentId++;
    const filter: EmailFilter = {
      ...insertFilter,
      id,
      createdAt: new Date(),
      lastRun: null
    };
    this.emailFilters.set(id, filter);
    return filter;
  }

  async updateEmailFilter(id: number, updates: Partial<EmailFilter>): Promise<EmailFilter | undefined> {
    const filter = this.emailFilters.get(id);
    if (!filter) return undefined;
    
    const updatedFilter = { ...filter, ...updates };
    this.emailFilters.set(id, updatedFilter);
    return updatedFilter;
  }

  async deleteEmailFilter(id: number): Promise<boolean> {
    return this.emailFilters.delete(id);
  }

  async getFinancialContacts(userId: number): Promise<FinancialContact[]> {
    return Array.from(this.financialContacts.values()).filter(contact => contact.userId === userId);
  }

  async createFinancialContact(insertContact: InsertFinancialContact): Promise<FinancialContact> {
    const id = this.currentId++;
    const contact: FinancialContact = {
      ...insertContact,
      id,
      createdAt: new Date()
    };
    this.financialContacts.set(id, contact);
    return contact;
  }

  async updateFinancialContact(id: number, updates: Partial<FinancialContact>): Promise<FinancialContact | undefined> {
    const contact = this.financialContacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact = { ...contact, ...updates };
    this.financialContacts.set(id, updatedContact);
    return updatedContact;
  }

  async getFinancialEmails(userId: number, category?: string): Promise<FinancialEmail[]> {
    const emails = Array.from(this.financialEmails.values()).filter(email => email.userId === userId);
    if (category) {
      return emails.filter(email => email.category === category);
    }
    return emails;
  }

  async createFinancialEmail(insertEmail: InsertFinancialEmail): Promise<FinancialEmail> {
    const id = this.currentId++;
    const email: FinancialEmail = {
      ...insertEmail,
      id,
      createdAt: new Date()
    };
    this.financialEmails.set(id, email);
    return email;
  }

  async getEmailStats(userId: number): Promise<{totalEmails: number, receipts: number, bills: number, statements: number}> {
    const emails = Array.from(this.financialEmails.values()).filter(email => email.userId === userId);
    
    return {
      totalEmails: emails.length,
      receipts: emails.filter(email => email.category === 'receipt').length,
      bills: emails.filter(email => email.category === 'bill').length,
      statements: emails.filter(email => email.category === 'statement').length,
    };
  }

  async getExportJobs(userId: number): Promise<ExportJob[]> {
    return Array.from(this.exportJobs.values()).filter(job => job.userId === userId);
  }

  async createExportJob(insertJob: InsertExportJob): Promise<ExportJob> {
    const id = this.currentId++;
    const job: ExportJob = {
      ...insertJob,
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.exportJobs.set(id, job);
    return job;
  }

  async updateExportJob(id: number, updates: Partial<ExportJob>): Promise<ExportJob | undefined> {
    const job = this.exportJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.exportJobs.set(id, updatedJob);
    return updatedJob;
  }
}

export const storage = new MemStorage();
