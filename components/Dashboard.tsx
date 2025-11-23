import React from 'react';
import { User, UserRole, Sale, Ticket } from '../types';
import { 
  DollarSign, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  FileWarning,
  LifeBuoy,
  Package
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useToast } from './Toast';

interface DashboardProps {
  user: User;
  onChangeView: (view: string) => void;
  salesData: Sale[];
  tickets?: Ticket[];
  users?: User[];
}

// Helper Card Component
const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color} shadow-lg shadow-current/20`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {subtext && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtext}</p>}
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ user, onChangeView, salesData, tickets = [], users = [] }) => {
  const { addToast } = useToast();

  const handleAction = (action: string) => {
    addToast(`${action} initiated successfully.`, 'success');
  };

  // --- Admin & Supervisor View ---
  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR) {
    const pendingAccountRequests = tickets.filter(t => t.category === 'REQUEST' && t.status === 'OPEN').length;
    const criticalTickets = tickets.filter(t => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')).length;
    const todayRevenue = salesData.filter(s => {
      const saleDate = new Date(s.startDate);
      const today = new Date();
      return saleDate.toDateString() === today.toDateString() && s.status === 'ACTIVE';
    }).reduce((sum, s) => sum + s.amount, 0);
    
    const todayExpenses = salesData.filter(s => {
      const saleDate = new Date(s.startDate);
      const today = new Date();
      return saleDate.toDateString() === today.toDateString() && s.status === 'ACTIVE';
    }).length * 5; // Mock expense calculation
    const data = [
      { name: 'Mon', income: 4000, expense: 2400 },
      { name: 'Tue', income: 3000, expense: 1398 },
      { name: 'Wed', income: 2000, expense: 9800 },
      { name: 'Thu', income: 2780, expense: 3908 },
      { name: 'Fri', income: 1890, expense: 4800 },
      { name: 'Sat', income: 2390, expense: 3800 },
      { name: 'Sun', income: 3490, expense: 4300 },
    ];

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.role === UserRole.ADMIN ? 'Executive Overview' : 'Office Dashboard'}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Today's Revenue" value={`$${todayRevenue.toFixed(2)}`} icon={DollarSign} color="bg-green-500" subtext={`Today's Income vs Expenses: $${(todayRevenue - todayExpenses).toFixed(2)}`} />
          <StatCard title="Active Agents" value={users.filter(u => u.role === UserRole.AGENT).length.toString()} icon={Users} color="bg-blue-500" subtext={`${pendingAccountRequests} account requests pending`} />
          <StatCard title="Critical Tickets" value={criticalTickets.toString()} icon={AlertCircle} color="bg-orange-500" subtext={`${tickets.filter(t => t.status === 'OPEN').length} total open tickets`} />
          <StatCard title="Team Performance" value="Active" icon={TrendingUp} color="bg-indigo-500" subtext="View detailed metrics in Finance" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue vs Expenses</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                    cursor={{fill: 'transparent'}}
                  />
                  <Bar dataKey="income" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Critical Tickets</h3>
            <div className="space-y-4">
                {tickets.filter(t => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')).slice(0, 5).map(ticket => {
                    const requester = users.find(u => u.id === ticket.requesterId);
                    return (
                        <div key={ticket.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer" onClick={() => onChangeView('support')}>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{ticket.subject}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Req: {requester?.name || ticket.requesterId} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-300 rounded-full">
                                {ticket.priority}
                            </span>
                        </div>
                    );
                })}
                {tickets.filter(t => (t.priority === 'CRITICAL' || t.priority === 'HIGH') && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')).length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No critical tickets</p>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Agent View ---
  if (user.role === UserRole.AGENT) {
    const today = new Date().toISOString().split('T')[0];
    const salesToday = salesData.filter(s => s.startDate === today && s.agentId === user.id).length;
    const expiringToday = salesData.filter(s => {
      const endDate = new Date(s.endDate);
      const todayDate = new Date();
      const diffTime = endDate.getTime() - todayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 1 && diffDays >= 0 && s.agentId === user.id && s.status === 'ACTIVE';
    }).length;
    const openTickets = tickets.filter(t => t.requesterId === user.id && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')).length;
    const pendingRequests = tickets.filter(t => t.requesterId === user.id && t.category === 'REQUEST' && t.status === 'OPEN').length;

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Workspace</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Sales Today" value={salesToday.toString()} icon={CheckCircle} color="bg-green-500" subtext="Keep pushing!" />
          <StatCard title="Expiring Soon" value={expiringToday.toString()} icon={Clock} color="bg-orange-500" subtext="Action required" />
          <StatCard title="Open Support" value={openTickets.toString()} icon={LifeBuoy} color="bg-blue-500" subtext={`${pendingRequests} pending requests`} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Expiring Soon</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Client</th>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3">End Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesData.filter(s => {
                            const endDate = new Date(s.endDate);
                            const today = new Date();
                            const diffTime = endDate.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays <= 7 && diffDays >= 0 && s.agentId === user.id && s.status === 'ACTIVE';
                        }).slice(0, 5).map((sale) => {
                            const client = users.find(u => u.id === sale.clientId);
                            return (
                                <tr key={sale.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{client?.name || `Client ${sale.clientId}`}</td>
                                    <td className="px-6 py-4">{sale.productName}</td>
                                    <td className="px-6 py-4">{sale.endDate}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            sale.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                                            sale.status === 'EXPIRED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => { onChangeView('sales'); handleAction('Renewal'); }} className="text-brand-600 hover:text-brand-900 dark:text-brand-400 font-medium hover:underline">Renew</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  }

  // --- Client View ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name}</h1>
        <button 
            onClick={() => onChangeView('support')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition-colors"
        >
            Report Issue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesData.filter(s => s.clientId === user.id).map(sale => (
             <div key={sale.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-brand-50 dark:bg-brand-900/30 rounded-lg">
                            <Package className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${sale.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                            {sale.status}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{sale.productName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Expires: {sale.endDate}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                    <button onClick={() => handleAction('Renewal request')} className="flex-1 text-sm bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg transition-colors">Renew</button>
                    <button onClick={() => handleAction('Details view')} className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg transition-colors">Details</button>
                </div>
             </div>
        ))}
      </div>
    </div>
  );
};