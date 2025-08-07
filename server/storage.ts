import { 
  users, 
  financeLabels, 
  emailFilters, 
  financialContacts, 
  financialEmails, 
  exportJobs,
  batchJobs,
  batchOperations,
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
  type InsertExportJob,
  type BatchJob,
  type InsertBatchJob,
  type BatchOperation,
  type InsertBatchOperation,
  type BulkEmailOperation,
  type BulkContactOperation
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

  // Batch jobs
  getBatchJobs(userId: number): Promise<BatchJob[]>;
  getBatchJob(id: number): Promise<BatchJob | undefined>;
  createBatchJob(job: InsertBatchJob): Promise<BatchJob>;
  updateBatchJob(id: number, updates: Partial<BatchJob>): Promise<BatchJob | undefined>;
  cancelBatchJob(id: number): Promise<boolean>;

  // Batch operations
  getBatchOperations(batchJobId: number): Promise<BatchOperation[]>;
  createBatchOperation(operation: InsertBatchOperation): Promise<BatchOperation>;
  updateBatchOperation(id: number, updates: Partial<BatchOperation>): Promise<BatchOperation | undefined>;

  // Bulk operations
  processBulkEmailOperation(userId: number, operation: BulkEmailOperation): Promise<BatchJob>;
  processBulkContactOperation(userId: number, operation: BulkContactOperation): Promise<BatchJob>;
  getBulkOperationStatus(batchJobId: number): Promise<{
    job: BatchJob;
    operations: BatchOperation[];
    summary: {
      total: number;
      completed: number;
      failed: number;
      pending: number;
    };
  } | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private financeLabels: Map<number, FinanceLabel> = new Map();
  private emailFilters: Map<number, EmailFilter> = new Map();
  private financialContacts: Map<number, FinancialContact> = new Map();
  private financialEmails: Map<number, FinancialEmail> = new Map();
  private exportJobs: Map<number, ExportJob> = new Map();
  private batchJobs: Map<number, BatchJob> = new Map();
  private batchOperations: Map<number, BatchOperation> = new Map();
  private currentId = 1;

  constructor() {
    this.seedSampleData();
  }

  private seedSampleData() {
    // Create sample user
    const user: User = {
      id: 1,
      email: "user@example.com",
      googleId: "google123",
      accessToken: "token123",
      refreshToken: "refresh123",
      createdAt: new Date()
    };
    this.users.set(1, user);

    // Create sample labels
    const labels = [
      { name: "Amazon Purchases", description: "All Amazon-related purchases", color: "#FF9500" },
      { name: "Utility Bills", description: "Monthly utility payments", color: "#007AFF" },
      { name: "Subscriptions", description: "Recurring subscriptions", color: "#34C759" },
    ];

    labels.forEach((label, index) => {
      const financeLabel: FinanceLabel = {
        id: index + 1,
        userId: 1,
        name: label.name,
        description: label.description,
        color: label.color,
        emailCount: Math.floor(Math.random() * 50) + 5,
        isActive: true,
        createdAt: new Date()
      };
      this.financeLabels.set(index + 1, financeLabel);
    });

    // Create sample contacts
    const contacts = [
      { name: "Amazon", email: "auto-confirm@amazon.com", type: "vendor" },
      { name: "PayPal", email: "service@paypal.com", type: "vendor" },
      { name: "Electric Company", email: "billing@electric.com", type: "utility" },
      { name: "Netflix", email: "info@netflix.com", type: "subscription" },
      { name: "Chase Bank", email: "alerts@chase.com", type: "bank" },
    ];

    contacts.forEach((contact, index) => {
      const financialContact: FinancialContact = {
        id: index + 1,
        userId: 1,
        name: contact.name,
        email: contact.email,
        type: contact.type,
        emailCount: Math.floor(Math.random() * 20) + 3,
        lastEmailDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        isInGoogleContacts: Math.random() > 0.5,
        createdAt: new Date()
      };
      this.financialContacts.set(index + 1, financialContact);
    });

    // Create sample emails
    const sampleEmails = [
      { from: "auto-confirm@amazon.com", subject: "Your Amazon.com order", category: "receipt", hasAttachments: true },
      { from: "service@paypal.com", subject: "You've got money", category: "confirmation", hasAttachments: false },
      { from: "billing@electric.com", subject: "Your monthly statement", category: "bill", hasAttachments: true },
      { from: "info@netflix.com", subject: "Netflix - Payment confirmation", category: "receipt", hasAttachments: false },
      { from: "alerts@chase.com", subject: "Account Statement Available", category: "statement", hasAttachments: true },
      { from: "auto-confirm@amazon.com", subject: "Your Amazon.com refund", category: "confirmation", hasAttachments: false },
      { from: "billing@electric.com", subject: "Payment reminder", category: "bill", hasAttachments: false },
      { from: "service@paypal.com", subject: "Transaction receipt", category: "receipt", hasAttachments: true },
    ];

    sampleEmails.forEach((email, index) => {
      const financialEmail: FinancialEmail = {
        id: index + 1,
        userId: 1,
        gmailId: `gmail_${index + 1}`,
        subject: email.subject,
        from: email.from,
        to: "user@example.com",
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        category: email.category,
        labelId: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : null,
        hasAttachments: email.hasAttachments,
        attachmentCount: email.hasAttachments ? Math.floor(Math.random() * 3) + 1 : 0,
        isExported: Math.random() > 0.7,
        metadata: { processed: true },
        createdAt: new Date()
      };
      this.financialEmails.set(index + 1, financialEmail);
    });

    this.currentId = 100; // Start IDs higher to avoid conflicts
  }

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
      createdAt: new Date(),
      accessToken: insertUser.accessToken || null,
      refreshToken: insertUser.refreshToken || null
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
      createdAt: new Date(),
      description: insertLabel.description || null,
      emailCount: insertLabel.emailCount || 0,
      isActive: insertLabel.isActive ?? true,
      color: insertLabel.color || "#1976D2"
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
      lastRun: null,
      isActive: insertFilter.isActive ?? true,
      matchCount: insertFilter.matchCount || 0
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
      createdAt: new Date(),
      emailCount: insertContact.emailCount || 0,
      lastEmailDate: insertContact.lastEmailDate || null,
      isInGoogleContacts: insertContact.isInGoogleContacts ?? false
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
      createdAt: new Date(),
      category: insertEmail.category || null,
      labelId: insertEmail.labelId || null,
      hasAttachments: insertEmail.hasAttachments ?? false,
      attachmentCount: insertEmail.attachmentCount || 0,
      isExported: insertEmail.isExported ?? false,
      metadata: insertEmail.metadata || null
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
      completedAt: null,
      status: insertJob.status || "pending",
      itemCount: insertJob.itemCount || 0,
      filePath: insertJob.filePath || null,
      errorMessage: insertJob.errorMessage || null
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

  // Batch jobs implementation
  async getBatchJobs(userId: number): Promise<BatchJob[]> {
    return Array.from(this.batchJobs.values()).filter(job => job.userId === userId);
  }

  async getBatchJob(id: number): Promise<BatchJob | undefined> {
    return this.batchJobs.get(id);
  }

  async createBatchJob(insertJob: InsertBatchJob): Promise<BatchJob> {
    const id = this.currentId++;
    const job: BatchJob = {
      ...insertJob,
      id,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      totalItems: insertJob.totalItems || 0,
      processedItems: insertJob.processedItems || 0,
      successfulItems: insertJob.successfulItems || 0,
      failedItems: insertJob.failedItems || 0,
      progress: insertJob.progress || 0,
      criteria: insertJob.criteria || null,
      actions: insertJob.actions || null,
      errorDetails: insertJob.errorDetails || null,
      status: insertJob.status || "pending"
    };
    this.batchJobs.set(id, job);
    return job;
  }

  async updateBatchJob(id: number, updates: Partial<BatchJob>): Promise<BatchJob | undefined> {
    const job = this.batchJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.batchJobs.set(id, updatedJob);
    return updatedJob;
  }

  async cancelBatchJob(id: number): Promise<boolean> {
    const job = this.batchJobs.get(id);
    if (!job || job.status === 'completed') return false;
    
    await this.updateBatchJob(id, { 
      status: 'cancelled',
      completedAt: new Date()
    });
    return true;
  }

  // Batch operations implementation
  async getBatchOperations(batchJobId: number): Promise<BatchOperation[]> {
    return Array.from(this.batchOperations.values()).filter(op => op.batchJobId === batchJobId);
  }

  async createBatchOperation(insertOperation: InsertBatchOperation): Promise<BatchOperation> {
    const id = this.currentId++;
    const operation: BatchOperation = {
      ...insertOperation,
      id,
      createdAt: new Date(),
      completedAt: null,
      result: insertOperation.result || null,
      errorMessage: insertOperation.errorMessage || null,
      processingTime: insertOperation.processingTime || null,
      status: insertOperation.status || "pending"
    };
    this.batchOperations.set(id, operation);
    return operation;
  }

  async updateBatchOperation(id: number, updates: Partial<BatchOperation>): Promise<BatchOperation | undefined> {
    const operation = this.batchOperations.get(id);
    if (!operation) return undefined;
    
    const updatedOperation = { ...operation, ...updates };
    this.batchOperations.set(id, updatedOperation);
    return updatedOperation;
  }

  // Bulk operations implementation
  async processBulkEmailOperation(userId: number, operation: BulkEmailOperation): Promise<BatchJob> {
    // Create batch job
    const batchJob = await this.createBatchJob({
      userId,
      type: `bulk_${operation.operation}`,
      criteria: operation.criteria,
      actions: operation.actions || {}
    });

    // Get emails matching criteria
    const allEmails = await this.getFinancialEmails(userId);
    const matchingEmails = this.filterEmailsByCriteria(allEmails, operation.criteria);

    // Update batch job with total count
    await this.updateBatchJob(batchJob.id, {
      totalItems: matchingEmails.length,
      status: 'in_progress',
      startedAt: new Date()
    });

    // Create batch operations for each email
    for (const email of matchingEmails) {
      await this.createBatchOperation({
        batchJobId: batchJob.id,
        itemId: email.id,
        itemType: 'email',
        operation: operation.operation,
        status: 'pending'
      });
    }

    // Simulate processing (in real implementation, this would be done asynchronously)
    setTimeout(() => this.processEmailBatch(batchJob.id, operation), 100);

    return batchJob;
  }

  async processBulkContactOperation(userId: number, operation: BulkContactOperation): Promise<BatchJob> {
    // Create batch job
    const batchJob = await this.createBatchJob({
      userId,
      type: `bulk_${operation.operation}`,
      criteria: operation.criteria,
      actions: operation.actions || {}
    });

    // Get contacts matching criteria
    const allContacts = await this.getFinancialContacts(userId);
    const matchingContacts = this.filterContactsByCriteria(allContacts, operation.criteria);

    // Update batch job with total count
    await this.updateBatchJob(batchJob.id, {
      totalItems: matchingContacts.length,
      status: 'in_progress',
      startedAt: new Date()
    });

    // Create batch operations for each contact
    for (const contact of matchingContacts) {
      await this.createBatchOperation({
        batchJobId: batchJob.id,
        itemId: contact.id,
        itemType: 'contact',
        operation: operation.operation,
        status: 'pending'
      });
    }

    // Simulate processing
    setTimeout(() => this.processContactBatch(batchJob.id, operation), 100);

    return batchJob;
  }

  async getBulkOperationStatus(batchJobId: number) {
    const job = await this.getBatchJob(batchJobId);
    if (!job) return undefined;

    const operations = await this.getBatchOperations(batchJobId);
    
    const summary = {
      total: operations.length,
      completed: operations.filter(op => op.status === 'completed').length,
      failed: operations.filter(op => op.status === 'failed').length,
      pending: operations.filter(op => op.status === 'pending').length
    };

    return { job, operations, summary };
  }

  // Helper methods for filtering
  private filterEmailsByCriteria(emails: FinancialEmail[], criteria: any): FinancialEmail[] {
    return emails.filter(email => {
      if (criteria.category && email.category !== criteria.category) return false;
      if (criteria.hasAttachments !== undefined && email.hasAttachments !== criteria.hasAttachments) return false;
      if (criteria.labelIds && criteria.labelIds.length > 0 && !criteria.labelIds.includes(email.labelId)) return false;
      if (criteria.fromDomains && criteria.fromDomains.length > 0) {
        const domain = email.from.split('@')[1];
        if (!criteria.fromDomains.includes(domain)) return false;
      }
      if (criteria.dateRange) {
        const emailDate = new Date(email.date);
        if (criteria.dateRange.start && emailDate < new Date(criteria.dateRange.start)) return false;
        if (criteria.dateRange.end && emailDate > new Date(criteria.dateRange.end)) return false;
      }
      return true;
    });
  }

  private filterContactsByCriteria(contacts: FinancialContact[], criteria: any): FinancialContact[] {
    return contacts.filter(contact => {
      if (criteria.types && criteria.types.length > 0 && !criteria.types.includes(contact.type)) return false;
      if (criteria.emailDomains && criteria.emailDomains.length > 0) {
        const domain = contact.email.split('@')[1];
        if (!criteria.emailDomains.includes(domain)) return false;
      }
      if (criteria.lastEmailBefore && contact.lastEmailDate) {
        if (new Date(contact.lastEmailDate) >= new Date(criteria.lastEmailBefore)) return false;
      }
      return true;
    });
  }

  // Simulate batch processing
  private async processEmailBatch(batchJobId: number, operation: BulkEmailOperation) {
    const operations = await this.getBatchOperations(batchJobId);
    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (const op of operations) {
      const startTime = Date.now();
      
      try {
        // Simulate processing each email
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        
        // Perform the actual operation based on type
        const result = await this.performEmailOperation(op.itemId, operation);
        
        await this.updateBatchOperation(op.id, {
          status: 'completed',
          result,
          processingTime: Date.now() - startTime,
          completedAt: new Date()
        });
        
        successful++;
      } catch (error) {
        await this.updateBatchOperation(op.id, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          processingTime: Date.now() - startTime,
          completedAt: new Date()
        });
        
        failed++;
      }
      
      processed++;
      const progress = Math.round((processed / operations.length) * 100);
      
      await this.updateBatchJob(batchJobId, {
        processedItems: processed,
        successfulItems: successful,
        failedItems: failed,
        progress
      });
    }

    await this.updateBatchJob(batchJobId, {
      status: 'completed',
      completedAt: new Date()
    });
  }

  private async processContactBatch(batchJobId: number, operation: BulkContactOperation) {
    const operations = await this.getBatchOperations(batchJobId);
    let processed = 0;
    let successful = 0;
    let failed = 0;

    for (const op of operations) {
      const startTime = Date.now();
      
      try {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        
        const result = await this.performContactOperation(op.itemId, operation);
        
        await this.updateBatchOperation(op.id, {
          status: 'completed',
          result,
          processingTime: Date.now() - startTime,
          completedAt: new Date()
        });
        
        successful++;
      } catch (error) {
        await this.updateBatchOperation(op.id, {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          processingTime: Date.now() - startTime,
          completedAt: new Date()
        });
        
        failed++;
      }
      
      processed++;
      const progress = Math.round((processed / operations.length) * 100);
      
      await this.updateBatchJob(batchJobId, {
        processedItems: processed,
        successfulItems: successful,
        failedItems: failed,
        progress
      });
    }

    await this.updateBatchJob(batchJobId, {
      status: 'completed',
      completedAt: new Date()
    });
  }

  private async performEmailOperation(emailId: number, operation: BulkEmailOperation): Promise<any> {
    const email = this.financialEmails.get(emailId);
    if (!email) throw new Error('Email not found');

    switch (operation.operation) {
      case 'categorize':
        if (operation.actions?.newCategory) {
          const updatedEmail = { ...email, category: operation.actions.newCategory };
          this.financialEmails.set(emailId, updatedEmail);
          return { oldCategory: email.category, newCategory: operation.actions.newCategory };
        }
        break;
      case 'label':
        if (operation.actions?.newLabelId) {
          const updatedEmail = { ...email, labelId: operation.actions.newLabelId };
          this.financialEmails.set(emailId, updatedEmail);
          return { oldLabelId: email.labelId, newLabelId: operation.actions.newLabelId };
        }
        break;
      case 'export':
        const updatedEmail = { ...email, isExported: true };
        this.financialEmails.set(emailId, updatedEmail);
        return { exported: true, type: operation.actions?.exportType };
      case 'delete':
        this.financialEmails.delete(emailId);
        return { deleted: true };
    }
    
    return { processed: true };
  }

  private async performContactOperation(contactId: number, operation: BulkContactOperation): Promise<any> {
    const contact = this.financialContacts.get(contactId);
    if (!contact) throw new Error('Contact not found');

    switch (operation.operation) {
      case 'categorize':
        if (operation.actions?.newType) {
          const updatedContact = { ...contact, type: operation.actions.newType };
          this.financialContacts.set(contactId, updatedContact);
          return { oldType: contact.type, newType: operation.actions.newType };
        }
        break;
      case 'delete':
        this.financialContacts.delete(contactId);
        return { deleted: true };
    }
    
    return { processed: true };
  }
}

export const storage = new MemStorage();
