// LocalStorage utility for data persistence
import { User, Account, Sale, Notification, Ticket, Supplier, Profile, AuditLog, FinancialOperation } from '../types';

const STORAGE_KEYS = {
  USERS: 'nexus_users',
  ACCOUNTS: 'nexus_accounts',
  SALES: 'nexus_sales',
  NOTIFICATIONS: 'nexus_notifications',
  TICKETS: 'nexus_tickets',
  SUPPLIERS: 'nexus_suppliers',
  PROFILES: 'nexus_profiles',
  AUDIT_LOGS: 'nexus_audit_logs',
  FINANCIAL_OPERATIONS: 'nexus_financial_operations',
};

export const storage = {
  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Accounts
  getAccounts: (): Account[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },
  saveAccounts: (accounts: Account[]) => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  // Sales
  getSales: (): Sale[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : [];
  },
  saveSales: (sales: Sale[]) => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  },

  // Notifications
  getNotifications: (): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  },
  saveNotifications: (notifications: Notification[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  // Tickets
  getTickets: (): Ticket[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return data ? JSON.parse(data) : [];
  },
  saveTickets: (tickets: Ticket[]) => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  },

  // Suppliers
  getSuppliers: (): Supplier[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return data ? JSON.parse(data) : [];
  },
  saveSuppliers: (suppliers: Supplier[]) => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  },

  // Profiles
  getProfiles: (): Profile[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return data ? JSON.parse(data) : [];
  },
  saveProfiles: (profiles: Profile[]) => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : [];
  },
  saveAuditLogs: (logs: AuditLog[]) => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  // Financial Operations
  getFinancialOperations: (): FinancialOperation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FINANCIAL_OPERATIONS);
    return data ? JSON.parse(data) : [];
  },
  saveFinancialOperations: (ops: FinancialOperation[]) => {
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_OPERATIONS, JSON.stringify(ops));
  },

  // Initialize with default data if storage is empty
  initialize: (defaultData: {
    users: User[];
    accounts: Account[];
    sales: Sale[];
    notifications: Notification[];
    tickets: Ticket[];
    suppliers: Supplier[];
    profiles: Profile[];
    auditLogs: AuditLog[];
    financialOps: FinancialOperation[];
  }) => {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      storage.saveUsers(defaultData.users);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
      storage.saveAccounts(defaultData.accounts);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      storage.saveSales(defaultData.sales);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      storage.saveNotifications(defaultData.notifications);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      storage.saveTickets(defaultData.tickets);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      storage.saveSuppliers(defaultData.suppliers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      storage.saveProfiles(defaultData.profiles);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      storage.saveAuditLogs(defaultData.auditLogs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCIAL_OPERATIONS)) {
      storage.saveFinancialOperations(defaultData.financialOps);
    }
  },
};

