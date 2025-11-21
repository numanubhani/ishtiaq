import { 
  Role, User, Client, Account, PendingAction, ApprovalStatus, 
  ActionType, ProductType, AccountType, AccountStatus, AuditLog 
} from '../types';

// --- Initial Dummy Data ---

const USERS: User[] = [
  { id: '1', username: 'admin', role: Role.ADMIN },
  { id: '2', username: 'supervisor', role: Role.SUPERVISOR },
  { id: '3', username: 'operator', role: Role.OPERATOR },
];

let clients: Client[] = [
  { id: 'c1', name: 'Acme Corp', email: 'contact@acme.com', status: 'Active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'c2', name: 'Globex Inc', email: 'info@globex.com', status: 'Active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let accounts: Account[] = [
  {
    id: 'a1',
    clientId: 'c1',
    usernameOnService: 'acme_netflix',
    encryptedPassword: 'supersecretpass',
    productType: ProductType.STREAMING,
    accountType: AccountType.REGULAR,
    accountStatus: AccountStatus.NORMAL,
    internalNotes: 'Main lobby display',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    passwordHistory: [],
    productData: { maxScreens: 4, quality: '4K' }
  },
  {
    id: 'a2',
    clientId: 'c2',
    usernameOnService: 'globex_vpn_01',
    encryptedPassword: 'securetunnel',
    productType: ProductType.VPN,
    accountType: AccountType.AUTOPAY,
    accountStatus: AccountStatus.NORMAL,
    internalNotes: 'Sales team generic login',
    createdBy: 'supervisor',
    createdAt: new Date().toISOString(),
    passwordHistory: [],
    productData: { location: 'US-East' }
  }
];

let pendingActions: PendingAction[] = [];
let auditLogs: AuditLog[] = [];

// --- Service Methods ---

export const MockService = {
  // Auth
  login: async (username: string): Promise<User | null> => {
    const user = USERS.find(u => u.username === username);
    if (user) return user;
    return null;
  },

  // Clients
  getClients: async (): Promise<Client[]> => [...clients],
  
  saveClient: async (client: Partial<Client>, user: User): Promise<void> => {
    // Logic: If Operator, submit for approval. If Supervisor/Admin, save directly.
    if (user.role === Role.OPERATOR) {
      const action: PendingAction = {
        id: Math.random().toString(36).substr(2, 9),
        type: client.id ? ActionType.UPDATE : ActionType.CREATE,
        entity: 'CLIENT',
        entityId: client.id,
        data: client,
        requestedBy: user.username,
        requestedAt: new Date().toISOString(),
        status: ApprovalStatus.PENDING
      };
      pendingActions.push(action);
    } else {
      if (client.id) {
        clients = clients.map(c => c.id === client.id ? { ...c, ...client, updatedAt: new Date().toISOString() } as Client : c);
        MockService.log('Client Updated', `Client ${client.name} updated`, user.username);
      } else {
        const newClient = { 
          ...client, 
          id: Math.random().toString(36).substr(2, 9), 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Client;
        clients.push(newClient);
        MockService.log('Client Created', `Client ${newClient.name} created`, user.username);
      }
    }
  },

  // Accounts
  getAccounts: async (): Promise<Account[]> => [...accounts],
  getAccountsByClient: async (clientId: string): Promise<Account[]> => accounts.filter(a => a.clientId === clientId),

  saveAccount: async (account: Partial<Account>, user: User): Promise<void> => {
    if (user.role === Role.OPERATOR) {
        const action: PendingAction = {
          id: Math.random().toString(36).substr(2, 9),
          type: account.id ? ActionType.UPDATE : ActionType.CREATE,
          entity: 'ACCOUNT',
          entityId: account.id,
          data: account,
          requestedBy: user.username,
          requestedAt: new Date().toISOString(),
          status: ApprovalStatus.PENDING
        };
        pendingActions.push(action);
    } else {
      if (account.id) {
        accounts = accounts.map(a => a.id === account.id ? { ...a, ...account } as Account : a);
        MockService.log('Account Updated', `Account ${account.usernameOnService} updated`, user.username);
      } else {
        const newAccount = { 
          ...account, 
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          passwordHistory: [],
          createdBy: user.username
        } as Account;
        accounts.push(newAccount);
        MockService.log('Account Created', `Account ${newAccount.usernameOnService} created`, user.username);
      }
    }
  },

  rotatePassword: async (accountId: string, user: User): Promise<string> => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) throw new Error("Account not found");

    const newPassword = Math.random().toString(36).slice(-10) + "!@#"; // Mock generation

    if (user.role === Role.OPERATOR) {
       const action: PendingAction = {
          id: Math.random().toString(36).substr(2, 9),
          type: ActionType.ROTATE_PASSWORD,
          entity: 'ACCOUNT',
          entityId: accountId,
          data: { encryptedPassword: newPassword },
          requestedBy: user.username,
          requestedAt: new Date().toISOString(),
          status: ApprovalStatus.PENDING
        };
        pendingActions.push(action);
        return "Pending Approval";
    } else {
      const oldHistory = [...account.passwordHistory];
      oldHistory.unshift({
        oldHash: account.encryptedPassword, // storing 'hash'
        changedAt: new Date().toISOString(),
        changedBy: user.username
      });
      
      account.encryptedPassword = newPassword;
      account.passwordHistory = oldHistory;
      account.accountStatus = AccountStatus.NORMAL; // Reset status on rotation
      MockService.log('Password Rotated', `Password rotated for ${account.usernameOnService}`, user.username);
      return newPassword;
    }
  },

  // Approvals
  getPendingActions: async (): Promise<PendingAction[]> => pendingActions.filter(p => p.status === ApprovalStatus.PENDING),

  resolveAction: async (actionId: string, approved: boolean, user: User): Promise<void> => {
    const actionIndex = pendingActions.findIndex(p => p.id === actionId);
    if (actionIndex === -1) return;

    const action = pendingActions[actionIndex];
    action.status = approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
    action.reviewedBy = user.username;
    action.reviewedAt = new Date().toISOString();

    if (approved) {
      // Apply the change
      if (action.entity === 'CLIENT') {
        if (action.type === ActionType.CREATE) {
           clients.push({ ...action.data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() });
        } else {
           clients = clients.map(c => c.id === action.entityId ? { ...c, ...action.data } : c);
        }
      } else if (action.entity === 'ACCOUNT') {
        if (action.type === ActionType.CREATE) {
          accounts.push({ 
            ...action.data, 
            id: Math.random().toString(36).substr(2, 9), 
            createdAt: new Date().toISOString(),
            passwordHistory: []
           });
        } else if (action.type === ActionType.UPDATE) {
           accounts = accounts.map(a => a.id === action.entityId ? { ...a, ...action.data } : a);
        } else if (action.type === ActionType.ROTATE_PASSWORD) {
           const acc = accounts.find(a => a.id === action.entityId);
           if (acc) {
             acc.passwordHistory.unshift({ oldHash: acc.encryptedPassword, changedAt: new Date().toISOString(), changedBy: action.requestedBy });
             acc.encryptedPassword = action.data.encryptedPassword;
             acc.accountStatus = AccountStatus.NORMAL;
           }
        }
      }
      MockService.log('Approval', `Approved action ${action.type} on ${action.entity}`, user.username);
    } else {
      MockService.log('Rejection', `Rejected action ${action.type} on ${action.entity}`, user.username);
    }
  },

  // Logs
  getLogs: async (): Promise<AuditLog[]> => [...auditLogs].reverse(),
  log: (action: string, details: string, actor: string) => {
    auditLogs.push({
      id: Math.random().toString(36).substr(2, 9),
      action,
      details,
      actor,
      timestamp: new Date().toISOString()
    });
  }
};
