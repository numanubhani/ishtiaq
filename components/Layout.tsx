import React, { useState } from 'react';
import { User, UserRole, Notification } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  LifeBuoy, 
  Briefcase, 
  Settings, 
  Bell, 
  Menu, 
  X,
  LogOut,
  Moon,
  Sun,
  Check
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  notifications: Notification[];
  onClearNotifications: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  onLogout, 
  currentView, 
  onChangeView,
  isDark,
  toggleTheme,
  notifications,
  onClearNotifications
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getMenuItems = (role: UserRole) => {
    const common = [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    
    if (role === UserRole.CLIENT) {
      return [
        ...common,
        { id: 'my-purchases', label: 'My Purchases', icon: ShoppingCart },
        { id: 'support', label: 'Support', icon: LifeBuoy },
      ];
    }

    const agentItems = [
      { id: 'crm', label: 'Customers (CRM)', icon: Users },
      { id: 'sales', label: 'Sales', icon: ShoppingCart },
      { id: 'support', label: 'Tickets', icon: LifeBuoy },
    ];

    if (role === UserRole.AGENT) {
      return [...common, ...agentItems];
    }

    if (role === UserRole.SUPERVISOR) {
      return [
        ...common,
        ...agentItems,
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'products', label: 'Products & Suppliers', icon: Package },
        { id: 'finance', label: 'Office & Finance', icon: Briefcase },
      ];
    }

    if (role === UserRole.ADMIN) {
      return [
        ...common,
        ...agentItems,
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'products', label: 'Products & Suppliers', icon: Package },
        { id: 'finance', label: 'Office & Finance', icon: Briefcase },
        { id: 'system', label: 'System & Logs', icon: Settings },
      ];
    }

    return common;
  };

  const menuItems = getMenuItems(currentUser.role);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Nexus</span>
          </div>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onChangeView(item.id);
                setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-brand-50 text-brand-600 dark:bg-gray-700 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
                <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{currentUser.role.toLowerCase()}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
            >
                <LogOut size={16} className="mr-2" />
                Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
             <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
             >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full outline-none"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsNotifOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-40 overflow-hidden transition-all duration-200">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      <button 
                        onClick={onClearNotifications}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                            <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.timestamp}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;