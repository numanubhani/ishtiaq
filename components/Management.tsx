import React, { useState } from 'react';
import { PRODUCTS, PRODUCT_TYPES } from '../constants';
import { Search, Plus, User as UserIcon, Shield, Server, Edit2, Trash2, ShoppingCart, DollarSign, TrendingUp, Activity, Terminal, Calendar, ExternalLink, X, RotateCcw, RefreshCw, Ban, Eye, Users as UsersIcon, FileText, Package } from 'lucide-react';
import { useToast } from './Toast';
import { User, UserRole, Account, Product, Sale, Profile, Supplier, Ticket, FinancialOperation, AuditLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// --- Helper: Simple Modal ---
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-xl w-full max-w-md transform transition-all overflow-hidden my-4">
                <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate pr-2">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 flex-shrink-0">
                        <X size={20} className="md:w-6 md:h-6" />
                    </button>
                </div>
                <div className="p-4 md:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Inventory Component ---
interface InventoryProps {
    accounts: Account[];
    products: Product[];
    profiles: Profile[];
    suppliers: Supplier[];
    onAddAccount: (account: Account) => void;
    onUpdateProfile: (profile: Profile) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ accounts, products, profiles, suppliers, onAddAccount, onUpdateProfile }) => {
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    
    // Filter State
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [filterProduct, setFilterProduct] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [productId, setProductId] = useState(products[0]?.id || '');
    const [maxProfiles, setMaxProfiles] = useState(5);

    const handleManage = (accountId: string) => {
        setSelectedAccountId(accountId);
        setIsProfileModalOpen(true);
    };

    const accountProfiles = selectedAccountId ? profiles.filter(p => p.accountId === selectedAccountId) : [];

    // Filter accounts
    const filteredAccounts = accounts.filter(account => {
        // Status filter
        if (filterStatus !== 'ALL' && account.status !== filterStatus) return false;
        
        // Product filter
        if (filterProduct !== 'ALL' && account.productId !== filterProduct) return false;
        
        // Search filter
        if (searchTerm) {
            const product = products.find(p => p.id === account.productId);
            const searchLower = searchTerm.toLowerCase();
            return (
                account.email.toLowerCase().includes(searchLower) ||
                product?.name.toLowerCase().includes(searchLower) ||
                account.id.toLowerCase().includes(searchLower)
            );
        }
        
        return true;
    });

    // Get unique product categories for filter
    const uniqueProducts = Array.from(new Set(accounts.map(a => a.productId)))
        .map(id => products.find(p => p.id === id))
        .filter(Boolean) as Product[];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAccount: Account = {
            id: `a${Date.now()}`,
            productId,
            email,
            password,
            maxProfiles,
            activeProfiles: 0,
            status: 'AVAILABLE'
        };
        onAddAccount(newAccount);
        setIsModalOpen(false);
        setEmail('');
        setPassword('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap"
                >
                    <Plus size={20} className="mr-2" />
                    Add Account
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search accounts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <div>
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        >
                            <option value="ALL">All Status</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="FULL">Full</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                    </div>

                    {/* Product Filter */}
                    <div>
                        <select 
                            value={filterProduct}
                            onChange={(e) => setFilterProduct(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        >
                            <option value="ALL">All Products</option>
                            {uniqueProducts.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {(filterStatus !== 'ALL' || filterProduct !== 'ALL' || searchTerm) && (
                        <button
                            onClick={() => {
                                setFilterStatus('ALL');
                                setFilterProduct('ALL');
                                setSearchTerm('');
                            }}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>
            
            {/* Results Count */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredAccounts.length} of {accounts.length} accounts
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredAccounts.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <Server size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No accounts found matching your filters</p>
                    </div>
                ) : (
                    filteredAccounts.map(account => {
                        const product = products.find(p => p.id === account.productId);
                        return (
                            <div key={account.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 hover:shadow-md transition-shadow flex flex-col">
                                <div className="flex justify-between items-start mb-4 gap-2">
                                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 flex-shrink-0">
                                            <Server size={18} className="md:w-5 md:h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base truncate" title={product?.name || 'Unknown Product'}>
                                                {product?.name || 'Unknown Product'}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={account.email}>
                                                {account.email}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`flex-shrink-0 px-2 py-1 text-xs font-bold rounded whitespace-nowrap ${
                                        account.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                                        account.status === 'FULL' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                    }`}>
                                        {account.status}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 mb-4 flex-1">
                                    <div className="flex justify-between text-xs md:text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Profiles Usage</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{account.activeProfiles} / {account.maxProfiles}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all duration-500 ${
                                                account.status === 'FULL' ? 'bg-red-500' : 'bg-brand-500'
                                            }`}
                                            style={{ width: `${Math.min((account.activeProfiles / account.maxProfiles) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button 
                                        onClick={() => handleManage(account.id)}
                                        className="flex-1 px-3 py-2 text-xs md:text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors whitespace-nowrap"
                                    >
                                        Manage Profiles
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Account">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Product</label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                        >
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Email</label>
                        <input 
                            type="email" required 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input 
                            type="text" required 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Profiles</label>
                        <input 
                            type="number" min="1" max="10" required 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={maxProfiles} onChange={e => setMaxProfiles(parseInt(e.target.value))}
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Save Account</button>
                    </div>
                </form>
            </Modal>

            {/* Profile Management Modal */}
            <Modal isOpen={isProfileModalOpen} onClose={() => { setIsProfileModalOpen(false); setSelectedAccountId(null); }} title="Manage Profiles">
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                        Account: <span className="font-medium text-gray-900 dark:text-white">{accounts.find(a => a.id === selectedAccountId)?.email || 'N/A'}</span>
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {accountProfiles.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No profiles yet. Create profiles for this account.</p>
                        ) : (
                            accountProfiles.map(profile => (
                                <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{profile.name}</p>
                                        <p className={`text-xs truncate ${
                                            profile.status === 'AVAILABLE' ? 'text-green-600 dark:text-green-400' : 
                                            profile.status === 'SOLD' ? 'text-blue-600 dark:text-blue-400' : 
                                            'text-red-600 dark:text-red-400'
                                        }`}>
                                            {profile.status}
                                        </p>
                                    </div>
                                    <select
                                        value={profile.status}
                                        onChange={(e) => onUpdateProfile({ ...profile, status: e.target.value as Profile['status'] })}
                                        className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-shrink-0"
                                    >
                                        <option value="AVAILABLE">Available</option>
                                        <option value="SOLD">Sold</option>
                                        <option value="ISSUE">Issue</option>
                                    </select>
                                </div>
                            ))
                        )}
                    </div>
                    <button
                        onClick={() => {
                            if (!selectedAccountId) return;
                            const account = accounts.find(a => a.id === selectedAccountId);
                            if (!account) return;
                            const newProfile: Profile = {
                                id: `prof_${Date.now()}`,
                                accountId: selectedAccountId,
                                name: `Profile ${accountProfiles.length + 1}`,
                                status: 'AVAILABLE'
                            };
                            onUpdateProfile(newProfile);
                            addToast('Profile created', 'success');
                        }}
                        className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm"
                    >
                        <Plus size={16} className="inline mr-2" />
                        Add Profile
                    </button>
                </div>
            </Modal>
        </div>
    );
};

// --- CRM Component ---
interface CRMProps {
    users: User[];
    sales: Sale[];
    onAddUser: (user: User) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    currentUser: User | null;
}

export const CRM: React.FC<CRMProps> = ({ users, sales, onAddUser, onUpdateUser, onDeleteUser, currentUser }) => {
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'delinquent' | 'oldest'>('list');
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.CLIENT);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
        setIsEditModalOpen(true);
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        const updatedUser: User = { ...selectedUser, name, email, role };
        onUpdateUser(updatedUser);
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setName('');
        setEmail('');
    };

    const handleDelete = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            onDeleteUser(userId);
        }
    };

    const clientUsers = users.filter(u => u.role === UserRole.CLIENT);
    const filteredUsers = clientUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const delinquentCustomers = clientUsers.filter(client => {
        const clientSales = sales.filter(s => s.clientId === client.id);
        const expiredSales = clientSales.filter(s => s.status === 'EXPIRED');
        const activeSales = clientSales.filter(s => s.status === 'ACTIVE');
        return expiredSales.length > 0 && activeSales.length === 0;
    });

    const oldestCustomers = [...clientUsers].sort((a, b) => {
        const aSales = sales.filter(s => s.clientId === a.id);
        const bSales = sales.filter(s => s.clientId === b.id);
        if (aSales.length === 0 && bSales.length === 0) return 0;
        if (aSales.length === 0) return 1;
        if (bSales.length === 0) return -1;
        const aOldest = Math.min(...aSales.map(s => new Date(s.startDate).getTime()));
        const bOldest = Math.min(...bSales.map(s => new Date(s.startDate).getTime()));
        return aOldest - bOldest;
    }).slice(0, 10);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: `u${Date.now()}`,
            name,
            email,
            role,
            avatar: `https://picsum.photos/100/100?random=${Date.now()}`
        };
        onAddUser(newUser);
        setIsModalOpen(false);
        setName('');
        setEmail('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Relationship (CRM)</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsReportsOpen(!isReportsOpen)}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <FileText size={20} className="mr-2" />
                        Reports
                    </button>
                    {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPERVISOR) && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                        >
                            <Plus size={20} className="mr-2" />
                            New Customer
                        </button>
                    )}
                </div>
            </div>

            {/* Reports Section */}
            {isReportsOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => setViewMode('delinquent')}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                            viewMode === 'delinquent' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                    >
                        <h3 className="font-bold text-gray-900 dark:text-white">Delinquent Customers</h3>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">{delinquentCustomers.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customers with expired subscriptions</p>
                    </button>
                    <button
                        onClick={() => setViewMode('oldest')}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                            viewMode === 'oldest' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                    >
                        <h3 className="font-bold text-gray-900 dark:text-white">Oldest Customers</h3>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">Top {oldestCustomers.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Longest-standing customers</p>
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search customers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" 
                        />
                    </div>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            viewMode === 'list' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        All Customers
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Sales History</th>
                                <th className="px-6 py-4">Status</th>
                                {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPERVISOR) && (
                                    <th className="px-6 py-4 text-right">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {(viewMode === 'delinquent' ? delinquentCustomers : viewMode === 'oldest' ? oldestCustomers : filteredUsers).map(u => {
                                const userSales = sales.filter(s => s.clientId === u.id);
                                const activeSales = userSales.filter(s => s.status === 'ACTIVE').length;
                                const expiredSales = userSales.filter(s => s.status === 'EXPIRED').length;
                                return (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 object-cover" />
                                            <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 text-xs">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded">
                                                    {activeSales} Active
                                                </span>
                                                <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded">
                                                    {expiredSales} Expired
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded">
                                                    {userSales.length} Total
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs ${activeSales > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {activeSales > 0 ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SUPERVISOR) && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEdit(u)} className="p-1 text-gray-500 hover:text-brand-600 transition-colors"><Edit2 size={16} /></button>
                                                    {u.id !== currentUser?.id && (
                                                        <button onClick={() => handleDelete(u.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Customer">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                        <input 
                            type="text" required 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={name} onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <input 
                            type="email" required 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                        >
                            <option value={UserRole.CLIENT}>Client</option>
                            <option value={UserRole.AGENT}>Agent</option>
                            <option value={UserRole.SUPERVISOR}>Supervisor</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Register</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// --- Sales Component ---
interface SalesProps {
    sales: Sale[];
    users: User[];
    products: Product[];
    profiles: Profile[];
    accounts: Account[];
    onAddSale: (sale: Sale) => void;
    onRenewSale: (saleId: string, days: number) => void;
    onReactivateSale: (saleId: string) => void;
    onExpelSale: (saleId: string) => void;
    onDeleteSale: (saleId: string) => void;
    currentUser: User | null;
}

export const Sales: React.FC<SalesProps> = ({ sales, users, products, profiles, accounts, onAddSale, onRenewSale, onReactivateSale, onExpelSale, onDeleteSale, currentUser }) => {
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
    const [renewDays, setRenewDays] = useState(30);

    // Form State
    const [clientId, setClientId] = useState('');
    const [productId, setProductId] = useState(products[0]?.id || '');
    const [profileId, setProfileId] = useState('');
    
    const handleRenewClick = (saleId: string) => {
        setSelectedSaleId(saleId);
        setIsRenewModalOpen(true);
    };

    const handleRenewConfirm = () => {
        if (selectedSaleId) {
            onRenewSale(selectedSaleId, renewDays);
            setIsRenewModalOpen(false);
            setSelectedSaleId(null);
        }
    };

    const handleReactivate = (saleId: string) => {
        if (window.confirm('Reactivate this expired sale?')) {
            onReactivateSale(saleId);
        }
    };

    const handleExpel = (saleId: string) => {
        if (window.confirm('Expel this sale and free the inventory?')) {
            onExpelSale(saleId);
        }
    };

    const handleDelete = (saleId: string) => {
        if (window.confirm('Delete this sale permanently?')) {
            onDeleteSale(saleId);
        }
    };

    // Get available profiles for selected product
    const availableProfiles = productId ? profiles.filter(p => {
        const account = accounts.find(a => a.id === p.accountId);
        return account && account.productId === productId && p.status === 'AVAILABLE';
    }) : [];

    const clients = users.filter(u => u.role === UserRole.CLIENT);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !productId || !profileId) {
            addToast('Please select a client, product, and available profile', 'error');
            return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) return;

        const selectedProfile = profiles.find(p => p.id === profileId);
        if (!selectedProfile || selectedProfile.status !== 'AVAILABLE') {
            addToast('Selected profile is not available', 'error');
            return;
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + product.durationDays);

        // Mark profile as sold
        const updatedProfile: Profile = { ...selectedProfile, status: 'SOLD' };

        const newSale: Sale = {
            id: `s${Date.now()}`,
            clientId,
            agentId: currentUser?.id || 'unknown',
            profileId: profileId,
            productName: product.name,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            amount: product.price,
            status: 'ACTIVE',
            autoRenew: false
        };
        onAddSale(newSale);
        setIsModalOpen(false);
        setClientId('');
        setProfileId('');
    };

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Management</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    New Sale
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                 <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Search sales..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">End Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sales.map((sale) => {
                            const client = users.find(u => u.id === sale.clientId);
                            return (
                                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sale.productName}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{client ? client.name : sale.clientId}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{sale.endDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            sale.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                            sale.status === 'EXPIRED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-white">${sale.amount}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 flex-wrap">
                                            {sale.status === 'ACTIVE' && (
                                                <button onClick={() => handleRenewClick(sale.id)} className="text-brand-600 hover:text-brand-900 dark:text-brand-400 hover:underline text-xs">
                                                    <RotateCcw size={14} className="inline mr-1" />
                                                    Renew
                                                </button>
                                            )}
                                            {sale.status === 'EXPIRED' && (
                                                <button onClick={() => handleReactivate(sale.id)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 hover:underline text-xs">
                                                    <RefreshCw size={14} className="inline mr-1" />
                                                    Reactivate
                                                </button>
                                            )}
                                            {sale.status === 'ACTIVE' && (
                                                <button onClick={() => handleExpel(sale.id)} className="text-orange-600 hover:text-orange-900 dark:text-orange-400 hover:underline text-xs">
                                                    <Ban size={14} className="inline mr-1" />
                                                    Expel
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(sale.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 hover:underline text-xs">
                                                <Trash2 size={14} className="inline mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Sale">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            required
                        >
                            <option value="">Select a client</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={productId}
                            onChange={(e) => {
                                setProductId(e.target.value);
                                setProfileId(''); // Reset profile selection
                            }}
                        >
                            <option value="">Select a product</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>)}
                        </select>
                    </div>
                    {productId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Profile</label>
                            {availableProfiles.length === 0 ? (
                                <p className="text-sm text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                    No available profiles for this product
                                </p>
                            ) : (
                                <select 
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                    value={profileId}
                                    onChange={(e) => setProfileId(e.target.value)}
                                    required
                                >
                                    <option value="">Select a profile</option>
                                    {availableProfiles.map(p => {
                                        const account = accounts.find(a => a.id === p.accountId);
                                        return (
                                            <option key={p.id} value={p.id}>
                                                {p.name} - {account?.email}
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                        </div>
                    )}
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Create Sale</button>
                    </div>
                </form>
            </Modal>

            {/* Renew Modal */}
            <Modal isOpen={isRenewModalOpen} onClose={() => { setIsRenewModalOpen(false); setSelectedSaleId(null); }} title="Renew Sale">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Extend by (days)</label>
                        <input 
                            type="number" 
                            min="1" 
                            required 
                            value={renewDays}
                            onChange={(e) => setRenewDays(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => { setIsRenewModalOpen(false); setSelectedSaleId(null); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                        <button onClick={handleRenewConfirm} className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Renew</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// --- My Purchases Component (Client View) ---
interface MyPurchasesProps {
    sales: Sale[];
    currentUser: User | null;
    onCreateTicket: (ticket: Ticket) => void;
}

export const MyPurchases: React.FC<MyPurchasesProps> = ({ sales, currentUser, onCreateTicket }) => {
    const { addToast } = useToast();
    const clientSales = sales.filter(s => s.clientId === currentUser?.id);

    const handleRenew = (sale: Sale) => {
        if (!currentUser) return;
        const ticket: Ticket = {
            id: `t${Date.now()}`,
            requesterId: currentUser.id,
            subject: `Renewal Request - ${sale.productName}`,
            description: `Request to renew subscription for ${sale.productName}. Sale ID: ${sale.id}`,
            status: 'OPEN' as any,
            priority: 'MEDIUM' as any,
            createdAt: new Date().toISOString(),
            category: 'SUPPORT'
        };
        onCreateTicket(ticket);
        addToast(`Renewal request sent! Ticket #${ticket.id}`, 'success');
    };

    const handleReportProblem = (sale: Sale) => {
        if (!currentUser) return;
        const ticket: Ticket = {
            id: `t${Date.now()}`,
            requesterId: currentUser.id,
            subject: `Problem Report - ${sale.productName}`,
            description: `Reporting an issue with ${sale.productName}. Sale ID: ${sale.id}`,
            status: 'OPEN' as any,
            priority: 'HIGH' as any,
            createdAt: new Date().toISOString(),
            category: 'SUPPORT'
        };
        onCreateTicket(ticket);
        addToast(`Issue reported! Ticket #${ticket.id}`, 'success');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Active Subscriptions</h1>
            {clientSales.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-10 rounded-xl text-center text-gray-500 dark:text-gray-400">
                    You have no active subscriptions.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clientSales.map(sale => (
                        <div key={sale.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-brand-50 dark:bg-brand-900/30 rounded-xl text-brand-600 dark:text-brand-400">
                                        <ShoppingCart size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{sale.productName}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {sale.id}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    sale.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                }`}>
                                    {sale.status}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Start Date</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{sale.startDate}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Expiring</p>
                                    <p className={`font-medium ${sale.status === 'EXPIRED' ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{sale.endDate}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Auto-Renew</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{sale.autoRenew ? 'On' : 'Off'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Price</p>
                                    <p className="font-medium text-gray-900 dark:text-white">${sale.amount}/mo</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleRenew(sale)}
                                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                >
                                    Request Renewal
                                </button>
                                <button 
                                    onClick={() => handleReportProblem(sale)}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                >
                                    Report Issue
                                </button>
                                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors">
                                    <ExternalLink size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// --- Finance Component ---
interface FinanceProps {
    sales: Sale[];
    products: Product[];
    users: User[];
    financialOps: FinancialOperation[];
    onAddFinancialOp: (op: FinancialOperation) => void;
}

export const Finance: React.FC<FinanceProps> = ({ sales, products, users, financialOps, onAddFinancialOp }) => {
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [opType, setOpType] = useState<'PAYMENT' | 'PETTY_CASH' | 'EXPENSE' | 'INCOME'>('EXPENSE');
    const [opAmount, setOpAmount] = useState('');
    const [opDescription, setOpDescription] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState('');

    const totalRevenue = sales.filter(s => s.status === 'ACTIVE').reduce((sum, s) => sum + s.amount, 0);
    const totalExpenses = products.reduce((sum, p) => {
        const productSales = sales.filter(s => s.productName === p.name && s.status === 'ACTIVE').length;
        return sum + (p.cost * productSales);
    }, 0);
    const totalOpsExpenses = financialOps.filter(f => f.type === 'EXPENSE' || f.type === 'PAYMENT' || f.type === 'PETTY_CASH').reduce((sum, f) => sum + f.amount, 0);
    const netProfit = totalRevenue - totalExpenses - totalOpsExpenses;

    // Profitability by product
    const profitabilityByProduct = products.map(p => {
        const productSales = sales.filter(s => s.productName === p.name && s.status === 'ACTIVE');
        const revenue = productSales.reduce((sum, s) => sum + s.amount, 0);
        const costs = p.cost * productSales.length;
        const profit = revenue - costs;
        const roi = costs > 0 ? ((profit / costs) * 100) : 0;
        return { product: p.name, revenue, costs, profit, roi, salesCount: productSales.length };
    });

    // Team Performance
    const agents = users.filter(u => u.role === UserRole.AGENT);
    const teamPerformance = agents.map(agent => {
        const agentSales = sales.filter(s => s.agentId === agent.id && s.status === 'ACTIVE');
        const revenue = agentSales.reduce((sum, s) => sum + s.amount, 0);
        return {
            agentId: agent.id,
            agentName: agent.name,
            salesCount: agentSales.length,
            totalRevenue: revenue,
            ticketsResolved: 0, // Would come from tickets
            averageResponseTime: 0 // Would calculate from ticket timestamps
        };
    });

    const data = [
        { name: 'Jan', income: 4000, expense: 2400 },
        { name: 'Feb', income: 3000, expense: 1398 },
        { name: 'Mar', income: 5000, expense: 2800 },
        { name: 'Apr', income: 4780, expense: 3908 },
        { name: 'May', income: 5890, expense: 4800 },
        { name: 'Jun', income: 6390, expense: 3800 },
    ];

    const handleAddOp = (e: React.FormEvent) => {
        e.preventDefault();
        const newOp: FinancialOperation = {
            id: `fin${Date.now()}`,
            type: opType,
            amount: parseFloat(opAmount),
            description: opDescription,
            userId: opType === 'PAYMENT' ? selectedAgentId : undefined,
            date: new Date().toISOString()
        };
        onAddFinancialOp(newOp);
        addToast('Financial operation recorded', 'success');
        setIsModalOpen(false);
        setOpAmount('');
        setOpDescription('');
        setSelectedAgentId('');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Office & Finance</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex items-center justify-between mb-4">
                         <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue (YTD)</h3>
                         <DollarSign className="text-green-500" />
                     </div>
                     <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
                     <p className="text-sm text-green-600 mt-2 font-medium flex items-center"><TrendingUp size={16} className="mr-1"/> From active sales</p>
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex items-center justify-between mb-4">
                         <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</h3>
                         <Activity className="text-red-500" />
                     </div>
                     <p className="text-3xl font-bold text-gray-900 dark:text-white">${(totalExpenses + totalOpsExpenses).toFixed(2)}</p>
                     <p className="text-sm text-gray-500 mt-2">Product costs + Operations</p>
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex items-center justify-between mb-4">
                         <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</h3>
                         <DollarSign className="text-brand-500" />
                     </div>
                     <p className="text-3xl font-bold text-gray-900 dark:text-white">${netProfit.toFixed(2)}</p>
                     <p className="text-sm text-brand-600 mt-2 font-medium">{(totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0).toFixed(1)}% Margin</p>
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Financial Performance</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                cursor={{fill: 'transparent'}}
                            />
                            <Bar dataKey="income" name="Income" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Profitability Analysis */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profitability by Product</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Sales</th>
                                <th className="px-6 py-4">Revenue</th>
                                <th className="px-6 py-4">Costs</th>
                                <th className="px-6 py-4">Profit</th>
                                <th className="px-6 py-4">ROI %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {profitabilityByProduct.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.product}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{item.salesCount}</td>
                                    <td className="px-6 py-4 text-green-600 dark:text-green-400">${item.revenue.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-red-600 dark:text-red-400">${item.costs.toFixed(2)}</td>
                                    <td className={`px-6 py-4 font-medium ${item.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        ${item.profit.toFixed(2)}
                                    </td>
                                    <td className={`px-6 py-4 font-medium ${item.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {item.roi.toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Team Performance */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Performance</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {teamPerformance.map(perf => (
                        <div key={perf.agentId} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{perf.agentName}</h4>
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-600 dark:text-gray-400">Sales: <span className="font-medium text-gray-900 dark:text-white">{perf.salesCount}</span></p>
                                <p className="text-gray-600 dark:text-gray-400">Revenue: <span className="font-medium text-green-600 dark:text-green-400">${perf.totalRevenue.toFixed(2)}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Operational Finances */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Operational Finances</h3>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm"
                    >
                        <Plus size={16} className="inline mr-2" />
                        Add Operation
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {financialOps.slice(0, 10).map(op => (
                                <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            op.type === 'INCOME' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            op.type === 'PAYMENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                            {op.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{op.description}</td>
                                    <td className={`px-6 py-4 font-medium ${op.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        ${op.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                        {new Date(op.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Financial Operation Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Financial Operation">
                <form onSubmit={handleAddOp} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            value={opType}
                            onChange={(e) => {
                                setOpType(e.target.value as any);
                                setSelectedAgentId('');
                            }}
                        >
                            <option value="EXPENSE">Expense</option>
                            <option value="PAYMENT">Payment (Agent)</option>
                            <option value="PETTY_CASH">Petty Cash</option>
                            <option value="INCOME">Income</option>
                        </select>
                    </div>
                    {opType === 'PAYMENT' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent</label>
                            <select 
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                value={selectedAgentId}
                                onChange={(e) => setSelectedAgentId(e.target.value)}
                                required
                            >
                                <option value="">Select an agent</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            required 
                            value={opAmount}
                            onChange={(e) => setOpAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <input 
                            type="text" 
                            required 
                            value={opDescription}
                            onChange={(e) => setOpDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Add Operation</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

// --- System Logs Component ---
interface SystemProps {
    auditLogs: AuditLog[];
}

export const System: React.FC<SystemProps> = ({ auditLogs }) => {
    const { addToast } = useToast();
    const [webhookUrl, setWebhookUrl] = useState('');
    
    const handleTestWebhook = () => {
        // Simulate webhook call to Make.com
        if (webhookUrl) {
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'test',
                    timestamp: new Date().toISOString(),
                    data: { test: true }
                })
            }).then(() => {
                addToast('Webhook test sent successfully', 'success');
            }).catch(() => {
                addToast('Webhook test failed', 'error');
            });
        } else {
            addToast('Please enter a webhook URL', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Logs & Audit</h1>
            
            <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden text-gray-300 font-mono text-sm">
                <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center gap-2">
                    <Terminal size={18} className="text-green-500" />
                    <span className="font-semibold text-white">Server Activity Log</span>
                </div>
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {auditLogs.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No logs yet</p>
                    ) : (
                        auditLogs.map(log => (
                            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <span className="text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                                    <span className="text-green-400">
                                        [{log.action.toUpperCase()}]
                                    </span>
                                    <span className="text-white">{log.action}</span>
                                    {log.details && (
                                        <span className="text-gray-400 text-xs">({log.details})</span>
                                    )}
                                </div>
                                <span className="text-gray-500 italic">by {log.userName} ({log.entityType}: {log.entityId})</span>
                            </div>
                        ))
                    )}
                    <div className="pt-4 text-green-500 animate-pulse">
                        _ Waiting for new events...
                    </div>
                </div>
            </div>

            {/* Webhook Integration */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Webhook Integration (Make.com)</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Webhook URL</label>
                        <input 
                            type="url" 
                            placeholder="https://hook.us1.make.com/..."
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Enter your Make.com webhook URL to receive events automatically
                        </p>
                    </div>
                    <button 
                        onClick={handleTestWebhook}
                        className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                    >
                        Test Webhook
                    </button>
                </div>
            </div>
        </div>
    )
}

// --- Products Management Component ---
interface ProductsManagementProps {
    products: Product[];
    suppliers: Supplier[];
    onUpdateSupplier: (supplier: Supplier) => void;
    onAddSupplier: (supplier: Supplier) => void;
    onDeleteSupplier: (supplierId: string) => void;
}

export const ProductsManagement: React.FC<ProductsManagementProps> = ({ products, suppliers, onUpdateSupplier, onAddSupplier, onDeleteSupplier }) => {
    const { addToast } = useToast();
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [supplierName, setSupplierName] = useState('');
    const [supplierEmail, setSupplierEmail] = useState('');
    const [supplierPhone, setSupplierPhone] = useState('');
    const [supplierContact, setSupplierContact] = useState('');

    const handleAddSupplier = (e: React.FormEvent) => {
        e.preventDefault();
        const newSupplier: Supplier = {
            id: `sup${Date.now()}`,
            name: supplierName,
            email: supplierEmail,
            phone: supplierPhone,
            contactPerson: supplierContact
        };
        onAddSupplier(newSupplier);
        setIsSupplierModalOpen(false);
        setSupplierName('');
        setSupplierEmail('');
        setSupplierPhone('');
        setSupplierContact('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products & Suppliers</h1>
                <button 
                    onClick={() => setIsSupplierModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Add Supplier
                </button>
            </div>

            {/* Suppliers List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Suppliers</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Contact Person</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {suppliers.map(supplier => (
                                <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{supplier.name}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{supplier.email || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{supplier.phone || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{supplier.contactPerson || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setSelectedSupplier(supplier); setSupplierName(supplier.name); setSupplierEmail(supplier.email || ''); setSupplierPhone(supplier.phone || ''); setSupplierContact(supplier.contactPerson || ''); setIsSupplierModalOpen(true); }} className="p-1 text-gray-500 hover:text-brand-600 transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => onDeleteSupplier(supplier.id)} className="p-1 text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Products List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Products</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Provider</th>
                                <th className="px-6 py-4">Cost</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">ROI Target</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Renewable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {products.map(product => {
                                const profit = product.price - product.cost;
                                const actualROI = product.cost > 0 ? ((profit / product.cost) * 100) : 0;
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{product.provider}</td>
                                        <td className="px-6 py-4 text-red-600 dark:text-red-400">${product.cost.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-green-600 dark:text-green-400">${product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-medium ${actualROI >= product.roiTarget ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                                {actualROI.toFixed(1)}% (Target: {product.roiTarget}%)
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{product.durationDays} days</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.isRenewable ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                                {product.isRenewable ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Supplier Modal */}
            <Modal isOpen={isSupplierModalOpen} onClose={() => { setIsSupplierModalOpen(false); setSelectedSupplier(null); setSupplierName(''); setSupplierEmail(''); setSupplierPhone(''); setSupplierContact(''); }} title={selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}>
                <form onSubmit={handleAddSupplier} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier Name</label>
                        <input 
                            type="text" required 
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input 
                            type="email"
                            value={supplierEmail}
                            onChange={(e) => setSupplierEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                        <input 
                            type="tel"
                            value={supplierPhone}
                            onChange={(e) => setSupplierPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
                        <input 
                            type="text"
                            value={supplierContact}
                            onChange={(e) => setSupplierContact(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => { setIsSupplierModalOpen(false); setSelectedSupplier(null); setSupplierName(''); setSupplierEmail(''); setSupplierPhone(''); setSupplierContact(''); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};