export enum Role {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  OPERATOR = 'OPERATOR'
}

export enum ProductType {
  STREAMING = 'Streaming',
  VPN = 'VPN',
  GAMING = 'Gaming',
  SOCIAL = 'Social'
}

export enum AccountType {
  REGULAR = 'Regular',
  AUTOPAY = 'Autopay',
  RENTED = 'Rented',
  FLOATING = 'Floating',
  ERROR = 'Error',
  REPORTED = 'Reported',
  PENDING_RENEWAL = 'Pending Renewal',
  EMAIL_ONLY = 'Email Only',
  NOT_YET_CREATED = 'Not Yet Created'
}

export enum AccountStatus {
  NORMAL = 'Normal',
  PASSWORD_CHANGE_REQUIRED = 'Password Change Required',
  CLIENT_UPDATE_REQUIRED = 'Client Update Required',
  LOCKED = 'Locked'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ROTATE_PASSWORD = 'ROTATE_PASSWORD'
}

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordHistory {
  oldHash: string; // Simulated hash
  changedAt: string;
  changedBy: string;
}

export interface Account {
  id: string;
  clientId: string;
  usernameOnService: string;
  encryptedPassword: string; // Simulated encryption
  productType: ProductType;
  accountType: AccountType;
  accountStatus: AccountStatus;
  internalNotes: string;
  createdBy: string;
  createdAt: string;
  passwordHistory: PasswordHistory[];
  // Dynamic fields based on ProductType would go here in a real NoSQL or JSONB structure
  productData?: Record<string, any>; 
}

export interface PendingAction {
  id: string;
  type: ActionType;
  entity: 'CLIENT' | 'ACCOUNT';
  entityId?: string; // Null if creating new
  data: any; // The proposed data
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  actor: string;
  timestamp: string;
}
