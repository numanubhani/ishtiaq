import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg transition-all transform translate-y-0 dark:bg-gray-800 bg-white border-l-4 ${
              toast.type === 'success' ? 'border-green-500' :
              toast.type === 'error' ? 'border-red-500' :
              'border-blue-500'
            }`}
            role="alert"
          >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            </div>
            <div className="ml-3 text-sm font-normal text-gray-800 dark:text-gray-200">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              type="button"
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};