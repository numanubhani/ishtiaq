export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  AGENT = 'AGENT',
  CLIENT = 'CLIENT',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface ProductType {
  id: string;
  name: string; // e.g., Netflix, HBO
  category: string;
}

export interface Product {
  id: string;
  typeId: string;
  name: string; // e.g., Netflix 1 Month
  durationDays: number;
  cost: number;
  price: number;
  roiTarget: number;
  provider: string;
  isRenewable: boolean;
}

export interface Account {
  id: string;
  productId: string;
  email: string; // Account login
  password?: string;
  status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE';
  maxProfiles: number;
  activeProfiles: number;
}

export interface Profile {
  id: string;
  accountId: string;
  name: string; // "Profile 1"
  pin?: string;
  status: 'AVAILABLE' | 'SOLD' | 'ISSUE';
}

export interface Sale {
  id: string;
  clientId: string;
  agentId: string;
  profileId: string; // Link to inventory
  productName: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  autoRenew: boolean;
}

export interface Ticket {
  id: string;
  requesterId: string; // Client or Agent
  assigneeId?: string; // Supervisor
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  category: 'SUPPORT' | 'REQUEST' | 'INCIDENT';
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface TeamPerformance {
  agentId: string;
  agentName: string;
  salesCount: number;
  totalRevenue: number;
  ticketsResolved: number;
  averageResponseTime: number;
}

export interface FinancialOperation {
  id: string;
  type: 'PAYMENT' | 'PETTY_CASH' | 'EXPENSE' | 'INCOME';
  amount: number;
  description: string;
  userId?: string;
  date: string;
}