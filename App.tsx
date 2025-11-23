import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Support } from './components/Support';
import { Inventory, CRM, Sales, Finance, System, MyPurchases, ProductsManagement } from './components/Management';
import { User, Account, Sale, Notification, Product, Ticket, Supplier, Profile, AuditLog, FinancialOperation } from './types';
import { USERS, ACCOUNTS, SALES, NOTIFICATIONS, PRODUCTS, SUPPLIERS, PROFILES, AUDIT_LOGS, FINANCIAL_OPERATIONS, TICKETS } from './constants';
import { ShieldCheck } from 'lucide-react';
import { ToastProvider, useToast } from './components/Toast';
import { storage } from './utils/storage';

// Wrap the main app logic to use the toast hook if needed in the top level, 
// but mainly to provide the context
const AppContent = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const { addToast } = useToast();

  // Initialize storage with default data
  useEffect(() => {
    storage.initialize({
      users: USERS,
      accounts: ACCOUNTS,
      sales: SALES,
      notifications: NOTIFICATIONS,
      tickets: TICKETS,
      suppliers: SUPPLIERS,
      profiles: PROFILES,
      auditLogs: AUDIT_LOGS,
      financialOps: FINANCIAL_OPERATIONS,
    });
  }, []);

  // Global State - Load from localStorage or use defaults
  const [users, setUsers] = useState<User[]>(() => {
    const stored = storage.getUsers();
    return stored.length > 0 ? stored : USERS;
  });
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const stored = storage.getAccounts();
    return stored.length > 0 ? stored : ACCOUNTS;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const stored = storage.getSales();
    return stored.length > 0 ? stored : SALES;
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = storage.getNotifications();
    return stored.length > 0 ? stored : NOTIFICATIONS;
  });
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const stored = storage.getTickets();
    return stored.length > 0 ? stored : TICKETS;
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const stored = storage.getSuppliers();
    return stored.length > 0 ? stored : SUPPLIERS;
  });
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const stored = storage.getProfiles();
    return stored.length > 0 ? stored : PROFILES;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const stored = storage.getAuditLogs();
    return stored.length > 0 ? stored : AUDIT_LOGS;
  });
  const [financialOps, setFinancialOps] = useState<FinancialOperation[]>(() => {
    const stored = storage.getFinancialOperations();
    return stored.length > 0 ? stored : FINANCIAL_OPERATIONS;
  });

  // Persist state changes to localStorage
  useEffect(() => {
    storage.saveUsers(users);
  }, [users]);

  useEffect(() => {
    storage.saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    storage.saveSales(sales);
  }, [sales]);

  useEffect(() => {
    storage.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    storage.saveTickets(tickets);
  }, [tickets]);

  useEffect(() => {
    storage.saveSuppliers(suppliers);
  }, [suppliers]);

  useEffect(() => {
    storage.saveProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    storage.saveAuditLogs(auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    storage.saveFinancialOperations(financialOps);
  }, [financialOps]);

  // Initialize Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Audit Log Helper
  const logAction = (action: string, entityType: string, entityId: string, details?: string) => {
    if (!currentUser) return;
    const log: AuditLog = {
      id: `log${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => {
      const updated = [log, ...prev];
      storage.saveAuditLogs(updated);
      return updated;
    });
  };

  const handleLogin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentView('dashboard');
      addToast(`Welcome back, ${user.name}!`, 'success');
      logAction('User Login', 'User', userId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    addToast('Logged out successfully', 'info');
  };

  // --- Data Handlers ---
  const handleAddUser = (newUser: User) => {
    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    storage.saveUsers(updatedUsers);
    addToast(`${newUser.role === 'CLIENT' ? 'Customer' : 'User'} ${newUser.name} created successfully`, 'success');
    logAction('Create User', 'User', newUser.id, `Role: ${newUser.role}`);
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      message: `New ${newUser.role === 'CLIENT' ? 'customer' : 'user'} registered: ${newUser.name}`,
      isRead: false,
      timestamp: 'Just now'
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    storage.saveNotifications(updatedNotifs);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsers(updated);
    storage.saveUsers(updated);
    addToast(`User ${updatedUser.name} updated successfully`, 'success');
    logAction('Update User', 'User', updatedUser.id);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.id === currentUser?.id) {
      addToast('Cannot delete your own account', 'error');
      return;
    }
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    storage.saveUsers(updated);
    addToast('User deleted successfully', 'success');
    logAction('Delete User', 'User', userId);
  };

  const handleRenewSale = (saleId: string, days: number) => {
    const updated = sales.map(s => {
      if (s.id === saleId) {
        const currentEndDate = new Date(s.endDate);
        currentEndDate.setDate(currentEndDate.getDate() + days);
        logAction('Renew Sale', 'Sale', saleId, `Extended by ${days} days`);
        return { ...s, endDate: currentEndDate.toISOString().split('T')[0], status: 'ACTIVE' as const };
      }
      return s;
    });
    setSales(updated);
    storage.saveSales(updated);
    addToast('Sale renewed successfully', 'success');
  };

  const handleReactivateSale = (saleId: string) => {
    const updated = sales.map(s => {
      if (s.id === saleId && s.status === 'EXPIRED') {
        const today = new Date();
        const newEndDate = new Date(today);
        newEndDate.setDate(newEndDate.getDate() + 30);
        logAction('Reactivate Sale', 'Sale', saleId);
        return { ...s, status: 'ACTIVE' as const, startDate: today.toISOString().split('T')[0], endDate: newEndDate.toISOString().split('T')[0] };
      }
      return s;
    });
    setSales(updated);
    storage.saveSales(updated);
    addToast('Sale reactivated successfully', 'success');
  };

  const handleExpelSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    const updatedSales = sales.map(s => {
      if (s.id === saleId) {
        logAction('Expel Sale', 'Sale', saleId);
        return { ...s, status: 'CANCELLED' as const };
      }
      return s;
    });
    setSales(updatedSales);
    storage.saveSales(updatedSales);
    
    if (sale) {
      const updatedProfiles = profiles.map(p => 
        p.id === sale.profileId ? { ...p, status: 'AVAILABLE' as const } : p
      );
      setProfiles(updatedProfiles);
      storage.saveProfiles(updatedProfiles);
    }
    addToast('Sale expelled and inventory freed', 'success');
  };

  const handleDeleteSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    const updatedSales = sales.filter(s => s.id !== saleId);
    setSales(updatedSales);
    storage.saveSales(updatedSales);
    
    if (sale) {
      const updatedProfiles = profiles.map(p => 
        p.id === sale.profileId ? { ...p, status: 'AVAILABLE' as const } : p
      );
      setProfiles(updatedProfiles);
      storage.saveProfiles(updatedProfiles);
    }
    logAction('Delete Sale', 'Sale', saleId);
    addToast('Sale deleted successfully', 'success');
  };

  const handleUpdateTicket = (ticket: Ticket) => {
    const updated = tickets.map(t => t.id === ticket.id ? ticket : t);
    setTickets(updated);
    storage.saveTickets(updated);
    logAction('Update Ticket', 'Ticket', ticket.id);
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      const newNotif: Notification = {
        id: `n${Date.now()}`,
        message: `Ticket #${ticket.id} has been ${ticket.status.toLowerCase()}`,
        isRead: false,
        timestamp: 'Just now'
      };
      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      storage.saveNotifications(updatedNotifs);
    }
  };

  const handleCreateTicket = (ticket: Ticket) => {
    const updated = [ticket, ...tickets];
    setTickets(updated);
    storage.saveTickets(updated);
    logAction('Create Ticket', 'Ticket', ticket.id);
    
    // Notify supervisors and admins about new tickets
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      message: `New ticket created: ${ticket.subject}${ticket.requesterId ? ` by ${users.find(u => u.id === ticket.requesterId)?.name || 'Client'}` : ''}`,
      isRead: false,
      timestamp: 'Just now'
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    storage.saveNotifications(updatedNotifs);
  };

  const handleAddSupplier = (supplier: Supplier) => {
    const updated = [supplier, ...suppliers];
    setSuppliers(updated);
    storage.saveSuppliers(updated);
    logAction('Create Supplier', 'Supplier', supplier.id);
    addToast('Supplier added successfully', 'success');
  };

  const handleUpdateSupplier = (supplier: Supplier) => {
    const updated = suppliers.map(s => s.id === supplier.id ? supplier : s);
    setSuppliers(updated);
    storage.saveSuppliers(updated);
    logAction('Update Supplier', 'Supplier', supplier.id);
    addToast('Supplier updated successfully', 'success');
  };

  const handleDeleteSupplier = (supplierId: string) => {
    const updated = suppliers.filter(s => s.id !== supplierId);
    setSuppliers(updated);
    storage.saveSuppliers(updated);
    logAction('Delete Supplier', 'Supplier', supplierId);
    addToast('Supplier deleted successfully', 'success');
  };

  const handleUpdateProfile = (profile: Profile) => {
    const existing = profiles.find(p => p.id === profile.id);
    const updated = existing 
      ? profiles.map(p => p.id === profile.id ? profile : p)
      : [...profiles, profile];
    setProfiles(updated);
    storage.saveProfiles(updated);
    logAction(existing ? 'Update Profile' : 'Create Profile', 'Profile', profile.id);
  };

  const handleAddAccount = (newAccount: Account) => {
    const updated = [newAccount, ...accounts];
    setAccounts(updated);
    storage.saveAccounts(updated);
    addToast('Inventory updated successfully', 'success');
    logAction('Create Account', 'Account', newAccount.id);
  };

  const handleAddSale = (newSale: Sale) => {
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    storage.saveSales(updatedSales);
    addToast('New sale recorded successfully', 'success');
    
    // Update account status
    const updatedAccounts = accounts.map(acc => {
      if (acc.productId === newSale.productName) {
         return { ...acc, activeProfiles: acc.activeProfiles + 1, status: acc.activeProfiles + 1 >= acc.maxProfiles ? 'FULL' : 'AVAILABLE' };
      }
      return acc;
    });
    setAccounts(updatedAccounts);
    storage.saveAccounts(updatedAccounts);

    const newNotif: Notification = {
      id: `n${Date.now()}`,
      message: `New sale created for ${newSale.productName}`,
      isRead: false,
      timestamp: 'Just now'
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    storage.saveNotifications(updatedNotifs);
    logAction('Create Sale', 'Sale', newSale.id);
  };

  const handleClearNotifications = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    storage.saveNotifications(updated);
  };

  // --- Login Screen (For Demo Purposes) ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-8 text-center border-b border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand-600/30">
              <ShieldCheck className="text-white w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NexusManager</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">SaaS Management Platform</p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">Select a role to demo the experience:</p>
            {users.slice(0,4).map(user => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                className="w-full flex items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-md transition-all group bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
              >
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-4 object-cover border border-gray-200 dark:border-gray-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{user.role}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 text-center border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400">© 2023 Nexus Systems. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Router Logic ---
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={currentUser} onChangeView={setCurrentView} salesData={sales} tickets={tickets} users={users} />;
      case 'support':
        return <Support currentUser={currentUser} tickets={tickets} onUpdateTicket={handleUpdateTicket} onCreateTicket={handleCreateTicket} users={users} />;
      case 'inventory':
        return <Inventory accounts={accounts} products={PRODUCTS} profiles={profiles} onAddAccount={handleAddAccount} onUpdateProfile={handleUpdateProfile} suppliers={suppliers} />;
      case 'crm':
        return <CRM users={users} sales={sales} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} currentUser={currentUser} />;
      case 'sales':
        return <Sales sales={sales} users={users} products={PRODUCTS} profiles={profiles} accounts={accounts} onAddSale={handleAddSale} onRenewSale={handleRenewSale} onReactivateSale={handleReactivateSale} onExpelSale={handleExpelSale} onDeleteSale={handleDeleteSale} currentUser={currentUser} />;
      case 'my-purchases': 
        return <MyPurchases sales={sales} currentUser={currentUser} onCreateTicket={handleCreateTicket} />;
      case 'finance':
        return <Finance sales={sales} products={PRODUCTS} users={users} financialOps={financialOps} onAddFinancialOp={(op) => { 
          const updated = [op, ...financialOps];
          setFinancialOps(updated);
          storage.saveFinancialOperations(updated);
          logAction('Create Financial Operation', 'Financial', op.id);
        }} />;
      case 'system':
        return <System auditLogs={auditLogs} />;
      case 'products':
        return <ProductsManagement products={PRODUCTS} suppliers={suppliers} onUpdateSupplier={handleUpdateSupplier} onAddSupplier={handleAddSupplier} onDeleteSupplier={handleDeleteSupplier} />;
      default:
        return <Dashboard user={currentUser} onChangeView={setCurrentView} salesData={sales} tickets={tickets} users={users} />;
    }
  };

  return (
    <Layout 
      currentUser={currentUser} 
      onLogout={handleLogout}
      currentView={currentView}
      onChangeView={setCurrentView}
      isDark={isDark}
      toggleTheme={toggleTheme}
      notifications={notifications}
      onClearNotifications={handleClearNotifications}
    >
      {renderContent()}
    </Layout>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;