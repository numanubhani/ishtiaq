import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, MonitorSmartphone, ShieldCheck, 
  Settings, LogOut, Plus, Edit, RefreshCcw, CheckCircle, XCircle,
  History, Lock, Search, Filter, FileText
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  Role, User, Client, Account, PendingAction, ApprovalStatus, 
  ProductType, AccountType, AccountStatus 
} from './types';
import { MockService } from './services/mockDb';

// --- TYPES & CONSTANTS ---

enum View {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CLIENTS = 'CLIENTS',
  ACCOUNTS = 'ACCOUNTS',
  APPROVALS = 'APPROVALS',
  ADMIN = 'ADMIN'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// --- COMPONENTS ---

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ status }: { status: string }) => {
  let classes = "bg-slate-100 text-slate-800";
  switch (status) {
    case 'Active':
    case 'Normal':
    case 'APPROVED':
      classes = "bg-green-100 text-green-800";
      break;
    case 'PENDING':
    case 'Pending Renewal':
      classes = "bg-yellow-100 text-yellow-800";
      break;
    case 'REJECTED':
    case 'Error':
    case 'Locked':
      classes = "bg-red-100 text-red-800";
      break;
    case 'Password Change Required':
      classes = "bg-orange-100 text-orange-800";
      break;
  }
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes}`}>{status}</span>;
};

// --- FORMS & MODALS ---

const ClientForm = ({ client, onClose, onSave }: { client?: Client, onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    status: client?.status || 'Active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-900">{client ? 'Edit Client' : 'New Client'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Company Name</label>
            <input 
              required
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              required type="email"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border bg-white text-slate-900"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select 
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm p-2 border bg-white text-slate-900"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const AccountForm = ({ account, clients, onClose, onSave }: { account?: Account, clients: Client[], onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState<Partial<Account>>({
    clientId: account?.clientId || (clients[0]?.id || ''),
    usernameOnService: account?.usernameOnService || '',
    encryptedPassword: account?.encryptedPassword || 'TempPass123!',
    productType: account?.productType || ProductType.STREAMING,
    accountType: account?.accountType || AccountType.REGULAR,
    accountStatus: account?.accountStatus || AccountStatus.NORMAL,
    internalNotes: account?.internalNotes || '',
    productData: account?.productData || {}
  });

  // Dynamic fields based on product type
  const renderProductFields = () => {
    switch(formData.productType) {
      case ProductType.STREAMING:
        return (
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="col-span-2 font-semibold text-xs uppercase text-slate-500">Streaming Config</div>
            <input placeholder="Max Screens" className="p-2 text-sm border rounded bg-white text-slate-900" 
              value={formData.productData?.maxScreens || ''} 
              onChange={e => setFormData({...formData, productData: {...formData.productData, maxScreens: e.target.value}})} />
            <input placeholder="Resolution (4K/HD)" className="p-2 text-sm border rounded bg-white text-slate-900" 
              value={formData.productData?.quality || ''} 
              onChange={e => setFormData({...formData, productData: {...formData.productData, quality: e.target.value}})} />
          </div>
        );
      case ProductType.VPN:
        return (
           <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="col-span-2 font-semibold text-xs uppercase text-slate-500">VPN Config</div>
            <input placeholder="Location" className="p-2 text-sm border rounded bg-white text-slate-900" 
               value={formData.productData?.location || ''} 
               onChange={e => setFormData({...formData, productData: {...formData.productData, location: e.target.value}})} />
            <input placeholder="Protocol" className="p-2 text-sm border rounded bg-white text-slate-900" 
               value={formData.productData?.protocol || ''} 
               onChange={e => setFormData({...formData, productData: {...formData.productData, protocol: e.target.value}})} />
          </div>
        );
      default:
        return <div className="text-sm text-slate-500 italic">Standard configuration applied.</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-slate-900">{account ? 'Edit Account' : 'New Account'}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Client</label>
              <select className="mt-1 block w-full rounded-md border-slate-300 border p-2 bg-white text-slate-900"
                value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Product Type</label>
              <select className="mt-1 block w-full rounded-md border-slate-300 border p-2 bg-white text-slate-900"
                value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value as ProductType})}>
                {Object.values(ProductType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700">Service Username</label>
              <input required className="mt-1 block w-full rounded-md border-slate-300 border p-2 bg-white text-slate-900"
                value={formData.usernameOnService} onChange={e => setFormData({...formData, usernameOnService: e.target.value})} />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">Initial Password</label>
              <input required type="password" className="mt-1 block w-full rounded-md border-slate-300 border p-2 bg-white text-slate-900"
                value={formData.encryptedPassword} onChange={e => setFormData({...formData, encryptedPassword: e.target.value})} 
                disabled={!!account} // Cannot change password directly in edit, must rotate
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Account Type</label>
              <select className="mt-1 block w-full rounded-md border-slate-300 border p-2 bg-white text-slate-900"
                value={formData.accountType} onChange={e => setFormData({...formData, accountType: e.target.value as AccountType})}>
                {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select className="mt-1 block w-full rounded-md border-slate-300 border p-2 bg-white text-slate-900"
                value={formData.accountStatus} onChange={e => setFormData({...formData, accountStatus: e.target.value as AccountStatus})}>
                {Object.values(AccountStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {renderProductFields()}

          <div>
             <label className="block text-sm font-medium text-slate-700">Internal Notes</label>
             <textarea className="mt-1 block w-full rounded-md border-slate-300 border p-2 bg-white text-slate-900" rows={3}
                value={formData.internalNotes} onChange={e => setFormData({...formData, internalNotes: e.target.value})} />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>(View.LOGIN);
  const [loginUsername, setLoginUsername] = useState('');
  const [error, setError] = useState('');

  // Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Refresh Data
  const refreshData = async () => {
    if (!user) return;
    setClients(await MockService.getClients());
    setAccounts(await MockService.getAccounts());
    setPendingActions(await MockService.getPendingActions());
    setLogs(await MockService.getLogs());
  };

  useEffect(() => {
    if (user) refreshData();
  }, [user, view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = await MockService.login(loginUsername);
    if (foundUser) {
      setUser(foundUser);
      setView(View.DASHBOARD);
      setError('');
    } else {
      setError('Invalid username. Try admin, supervisor, or operator.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView(View.LOGIN);
    setLoginUsername('');
  };

  // Actions
  const handleSaveClient = async (data: any) => {
    if (!user) return;
    await MockService.saveClient({ ...editingItem, ...data }, user);
    setIsClientModalOpen(false);
    setEditingItem(null);
    refreshData();
  };

  const handleSaveAccount = async (data: any) => {
    if (!user) return;
    await MockService.saveAccount({ ...editingItem, ...data }, user);
    setIsAccountModalOpen(false);
    setEditingItem(null);
    refreshData();
  };

  const handleRotatePassword = async (id: string) => {
    if (!user) return;
    if (!window.confirm("Rotate password? This may trigger a workflow.")) return;
    await MockService.rotatePassword(id, user);
    refreshData();
  };

  const handleApproval = async (id: string, approved: boolean) => {
    if (!user) return;
    await MockService.resolveAction(id, approved, user);
    refreshData();
  };

  // Views
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="h-12 w-12 bg-indigo-600 rounded-lg mx-auto flex items-center justify-center mb-4">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Nexus Manager</h1>
            <p className="text-slate-500">Secure Client & Account Access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                placeholder="admin / supervisor / operator"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              Sign In
            </button>
          </form>
          <div className="mt-6 text-xs text-center text-slate-400">
            <p>Demo Credentials:</p>
            <p>admin / supervisor / operator</p>
          </div>
        </Card>
      </div>
    );
  }

  const SidebarItem = ({ icon: Icon, label, targetView }: any) => (
    <button 
      onClick={() => setView(targetView)}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${view === targetView ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  // -- Dashboard View --
  const DashboardView = () => {
    const typeData = Object.values(ProductType).map(type => ({
      name: type,
      value: accounts.filter(a => a.productType === type).length
    }));

    const statusData = Object.values(AccountStatus).map(status => ({
        name: status,
        value: accounts.filter(a => a.accountStatus === status).length
    })).filter(i => i.value > 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full"><Users className="text-blue-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Total Clients</p>
              <h3 className="text-2xl font-bold text-slate-900">{clients.length}</h3>
            </div>
          </Card>
          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-full"><MonitorSmartphone className="text-indigo-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Total Accounts</p>
              <h3 className="text-2xl font-bold text-slate-900">{accounts.length}</h3>
            </div>
          </Card>
          <Card className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full"><Lock className="text-orange-600" /></div>
            <div>
              <p className="text-sm text-slate-500">Pending Actions</p>
              <h3 className="text-2xl font-bold text-slate-900">{pendingActions.length}</h3>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
                <h3 className="font-semibold mb-4 text-slate-800">Products Distribution</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={typeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip contentStyle={{ color: '#1e293b' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <Card className="p-6">
                <h3 className="font-semibold mb-4 text-slate-800">Account Status Health</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ color: '#1e293b' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
      </div>
    );
  };

  // -- Clients View --
  const ClientsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Clients</h2>
        <button onClick={() => { setEditingItem(null); setIsClientModalOpen(true); }} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          <Plus size={18} /> <span>Add Client</span>
        </button>
      </div>
      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {clients.map(client => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{client.email}</td>
                <td className="px-6 py-4 whitespace-nowrap"><Badge status={client.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => { setEditingItem(client); setIsClientModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1">
                    <Edit size={16} /> <span>Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  // -- Accounts View --
  const AccountsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Accounts</h2>
        <button onClick={() => { setEditingItem(null); setIsAccountModalOpen(true); }} className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          <Plus size={18} /> <span>Add Account</span>
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {accounts.map(acc => {
            const clientName = clients.find(c => c.id === acc.clientId)?.name || 'Unknown';
            return (
                <Card key={acc.id} className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-lg text-slate-900">{acc.usernameOnService}</h3>
                                <Badge status={acc.accountStatus} />
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{acc.productType}</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Client: {clientName} • Type: {acc.accountType}</p>
                            <div className="mt-2 text-sm font-mono bg-slate-50 text-slate-700 p-2 rounded inline-block border border-slate-200">
                                Password: {acc.encryptedPassword.substring(0, 4)}••••••••
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => handleRotatePassword(acc.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded tooltip-trigger" title="Rotate Password">
                                <RefreshCcw size={18} />
                            </button>
                            <button 
                                onClick={() => { setEditingItem(acc); setIsAccountModalOpen(true); }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                <Edit size={18} />
                            </button>
                        </div>
                    </div>
                    {/* Product Specific Data Display */}
                    {acc.productData && Object.keys(acc.productData).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 grid grid-cols-2 gap-2">
                            {Object.entries(acc.productData).map(([k, v]) => (
                                <div key={k}><span className="font-semibold capitalize">{k}:</span> {v}</div>
                            ))}
                        </div>
                    )}
                </Card>
            );
        })}
      </div>
    </div>
  );

  // -- Approvals View --
  const ApprovalsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Pending Approvals</h2>
      {pendingActions.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
            <CheckCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p>All caught up! No pending actions.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {pendingActions.map(action => (
                <Card key={action.id} className="p-4 flex justify-between items-center">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className={`font-bold text-sm px-2 py-0.5 rounded ${action.type === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {action.type}
                            </span>
                            <span className="font-semibold text-slate-700">{action.entity}</span>
                            <span className="text-xs text-slate-400">ID: {action.entityId || 'New'}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                            Requested by <span className="font-medium text-slate-900">{action.requestedBy}</span> on {new Date(action.requestedAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border">
                            <pre>{JSON.stringify(action.data, null, 2)}</pre>
                        </div>
                    </div>
                    {user.role !== Role.OPERATOR && (
                        <div className="flex flex-col space-y-2 ml-4">
                            <button onClick={() => handleApproval(action.id, true)} className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">
                                <CheckCircle size={14} /> <span>Approve</span>
                            </button>
                            <button onClick={() => handleApproval(action.id, false)} className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700">
                                <XCircle size={14} /> <span>Reject</span>
                            </button>
                        </div>
                    )}
                </Card>
            ))}
        </div>
      )}
    </div>
  );

  // -- Admin View --
  const AdminView = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">System Logs & Admin</h2>
        <Card className="overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-700">Audit Log</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td className="px-6 py-2 whitespace-nowrap text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-slate-900">{log.actor}</td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm text-slate-600">{log.action}</td>
                                <td className="px-6 py-2 text-sm text-slate-500">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xl">
            <ShieldCheck className="w-8 h-8" />
            <span>Nexus</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" targetView={View.DASHBOARD} />
          <SidebarItem icon={Users} label="Clients" targetView={View.CLIENTS} />
          <SidebarItem icon={MonitorSmartphone} label="Accounts" targetView={View.ACCOUNTS} />
          
          {(user.role === Role.ADMIN || user.role === Role.SUPERVISOR) && (
            <SidebarItem icon={FileText} label="Approvals" targetView={View.APPROVALS} />
          )}
          
          {user.role === Role.ADMIN && (
            <SidebarItem icon={Settings} label="Admin & Logs" targetView={View.ADMIN} />
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold uppercase">
              {user.username[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{user.username}</p>
              <p className="text-xs text-slate-500 uppercase">{user.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 text-sm text-slate-600 hover:text-red-600 p-2 hover:bg-white rounded transition-colors border border-transparent hover:border-slate-200">
            <LogOut size={16} /> <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {view === View.DASHBOARD && <DashboardView />}
        {view === View.CLIENTS && <ClientsView />}
        {view === View.ACCOUNTS && <AccountsView />}
        {view === View.APPROVALS && <ApprovalsView />}
        {view === View.ADMIN && <AdminView />}
      </div>

      {/* Modals */}
      {isClientModalOpen && (
        <ClientForm 
            client={editingItem} 
            onClose={() => setIsClientModalOpen(false)} 
            onSave={handleSaveClient} 
        />
      )}
      {isAccountModalOpen && (
        <AccountForm 
            account={editingItem} 
            clients={clients}
            onClose={() => setIsAccountModalOpen(false)} 
            onSave={handleSaveAccount} 
        />
      )}
    </div>
  );
}