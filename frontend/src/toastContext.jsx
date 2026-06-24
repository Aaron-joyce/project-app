import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically remove after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);

  const toast = { success, error, info };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed top-24 right-8 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { type, message } = toast;

  // Modern HSL-tailored/glassmorphism colors matching Stone/Olive palette
  const config = {
    success: {
      border: 'border-emerald-500/30',
      bg: 'bg-stone-900/85 backdrop-blur-md shadow-emerald-500/5',
      iconColor: 'text-emerald-400',
      progressBg: 'bg-emerald-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      border: 'border-red-500/30',
      bg: 'bg-stone-900/85 backdrop-blur-md shadow-red-500/5',
      iconColor: 'text-red-400',
      progressBg: 'bg-red-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      border: 'border-stone-600/30',
      bg: 'bg-stone-900/85 backdrop-blur-md shadow-stone-500/5',
      iconColor: 'text-stone-300',
      progressBg: 'bg-stone-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const style = config[type] || config.info;

  return (
    <div 
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${style.border} ${style.bg} shadow-lg animate-slide-in-right relative overflow-hidden`}
      role="alert"
    >
      <div className={`${style.iconColor} shrink-0 mt-0.5`}>
        {style.icon}
      </div>
      <div className="flex-1 text-sm font-medium text-stone-100 pr-4">
        {message}
      </div>
      <button 
        onClick={onClose} 
        className="text-stone-400 hover:text-stone-200 transition-colors shrink-0 absolute top-3 right-3 cursor-pointer"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Modern micro-animated countdown bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-850">
        <div className={`h-full ${style.progressBg} animate-shrink-width`} style={{ animationDuration: '4500ms' }} />
      </div>
    </div>
  );
};
