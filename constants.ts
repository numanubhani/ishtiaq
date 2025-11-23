import { User, UserRole, Product, Sale, Ticket, TicketStatus, TicketPriority, Notification, Account, Supplier, ProductType, Profile, AuditLog, FinancialOperation } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Alice Admin', email: 'alice@nexus.com', role: UserRole.ADMIN, avatar: 'https://picsum.photos/100/100?random=1' },
  { id: 'u2', name: 'Steve Supervisor', email: 'steve@nexus.com', role: UserRole.SUPERVISOR, avatar: 'https://picsum.photos/100/100?random=2' },
  { id: 'u3', name: 'Aaron Agent', email: 'aaron@nexus.com', role: UserRole.AGENT, avatar: 'https://picsum.photos/100/100?random=3' },
  { id: 'u4', name: 'Charlie Client', email: 'charlie@gmail.com', role: UserRole.CLIENT, avatar: 'https://picsum.photos/100/100?random=4' },
];

export const PRODUCTS: Product[] = [
  { id: 'p1', typeId: 't1', name: 'Netflix Premium 4K (1 Month)', durationDays: 30, cost: 3.50, price: 9.99, roiTarget: 185, provider: 'GlobalDigital', isRenewable: true },
  { id: 'p2', typeId: 't2', name: 'HBO Max Standard (3 Months)', durationDays: 90, cost: 8.00, price: 15.00, roiTarget: 87, provider: 'StreamSupply', isRenewable: true },
  { id: 'p3', typeId: 't3', name: 'Spotify Individual (Lifetime)', durationDays: 365, cost: 12.00, price: 25.00, roiTarget: 108, provider: 'MusicHub', isRenewable: false },
];

export const ACCOUNTS: Account[] = [
  { id: 'a1', productId: 'p1', email: 'net1@stock.com', status: 'AVAILABLE', maxProfiles: 5, activeProfiles: 2 },
  { id: 'a2', productId: 'p1', email: 'net2@stock.com', status: 'FULL', maxProfiles: 5, activeProfiles: 5 },
  { id: 'a3', productId: 'p2', email: 'hbo1@stock.com', status: 'MAINTENANCE', maxProfiles: 3, activeProfiles: 0 },
];

export const SALES: Sale[] = [
  { id: 's1', clientId: 'u4', agentId: 'u3', profileId: 'prof_1', productName: 'Netflix Premium 4K', startDate: '2023-10-01', endDate: '2023-10-31', amount: 9.99, status: 'ACTIVE', autoRenew: true },
  { id: 's2', clientId: 'u4', agentId: 'u3', profileId: 'prof_2', productName: 'Spotify Individual', startDate: '2023-01-01', endDate: '2023-12-31', amount: 25.00, status: 'ACTIVE', autoRenew: false },
  { id: 's3', clientId: 'u5', agentId: 'u3', profileId: 'prof_3', productName: 'Netflix Premium 4K', startDate: '2023-09-01', endDate: '2023-09-30', amount: 9.99, status: 'EXPIRED', autoRenew: false },
];

export const TICKETS: Ticket[] = [
  { id: 't1', requesterId: 'u4', assigneeId: 'u2', subject: 'Login not working', description: 'I cannot access my Netflix profile.', status: TicketStatus.OPEN, priority: TicketPriority.HIGH, createdAt: '2023-10-15T10:00:00', category: 'SUPPORT' },
  { id: 't2', requesterId: 'u3', assigneeId: 'u2', subject: 'Request new HBO Stock', description: 'We are running low on HBO 3 month accounts.', status: TicketStatus.OPEN, priority: TicketPriority.MEDIUM, createdAt: '2023-10-14T14:30:00', category: 'REQUEST' },
  { id: 't3', requesterId: 'u4', subject: 'Renewal Question', description: 'How do I pay with Crypto?', status: TicketStatus.RESOLVED, priority: TicketPriority.LOW, createdAt: '2023-10-10T09:15:00', category: 'SUPPORT' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', message: 'Ticket #t1 assigned to you.', isRead: false, timestamp: '10 min ago' },
  { id: 'n2', message: 'Low stock warning: HBO Max.', isRead: false, timestamp: '1 hour ago' },
  { id: 'n3', message: 'Sales report for October is ready.', isRead: true, timestamp: '1 day ago' },
];

export const SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'GlobalDigital', email: 'contact@globaldigital.com', phone: '+1-555-0101', contactPerson: 'John Doe' },
  { id: 'sup2', name: 'StreamSupply', email: 'info@streamsupply.com', phone: '+1-555-0102', contactPerson: 'Jane Smith' },
  { id: 'sup3', name: 'MusicHub', email: 'sales@musichub.com', phone: '+1-555-0103', contactPerson: 'Bob Johnson' },
];

export const PRODUCT_TYPES: ProductType[] = [
  { id: 't1', name: 'Netflix', category: 'Streaming' },
  { id: 't2', name: 'HBO Max', category: 'Streaming' },
  { id: 't3', name: 'Spotify', category: 'Music' },
];

export const PROFILES: Profile[] = [
  { id: 'prof_1', accountId: 'a1', name: 'Profile 1', status: 'SOLD' },
  { id: 'prof_2', accountId: 'a1', name: 'Profile 2', status: 'SOLD' },
  { id: 'prof_3', accountId: 'a1', name: 'Profile 3', status: 'AVAILABLE' },
  { id: 'prof_4', accountId: 'a1', name: 'Profile 4', status: 'AVAILABLE' },
  { id: 'prof_5', accountId: 'a1', name: 'Profile 5', status: 'AVAILABLE' },
];

export const AUDIT_LOGS: AuditLog[] = [
  { id: 'log1', userId: 'u1', userName: 'Alice Admin', action: 'User Login', entityType: 'User', entityId: 'u1', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'log2', userId: 'u2', userName: 'Steve Supervisor', action: 'Update Inventory', entityType: 'Account', entityId: 'a1', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'log3', userId: 'u3', userName: 'Aaron Agent', action: 'Create Sale', entityType: 'Sale', entityId: 's1', timestamp: new Date(Date.now() - 10800000).toISOString() },
];

export const FINANCIAL_OPERATIONS: FinancialOperation[] = [
  { id: 'fin1', type: 'PAYMENT', amount: 500, description: 'Agent payment - Aaron Agent', userId: 'u3', date: new Date().toISOString() },
  { id: 'fin2', type: 'PETTY_CASH', amount: 50, description: 'Office supplies', date: new Date().toISOString() },
  { id: 'fin3', type: 'EXPENSE', amount: 200, description: 'Provider costs - GlobalDigital', date: new Date().toISOString() },
];