"use client"
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';

// Toast types and interfaces
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
export type ToastAnimation = 'slide' | 'fade' | 'bounce' | 'scale';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  persistent?: boolean;
  position?: ToastPosition;
  animation?: ToastAnimation;
  icon?: ReactNode;
  showIcon?: boolean;
  title?: string;
  description?: string;
  action?: ToastAction;
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
  closable?: boolean;
  progress?: boolean;
  sound?: boolean;
}

export interface Toast extends Required<Omit<ToastOptions, 'onClose'>> {
  id: string;
  message: string;
  createdAt: number;
  onClose?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (message: string, options?: ToastOptions) => string;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, options: Partial<ToastOptions>) => void;
}

// Default configuration
const defaultToastOptions: Required<Omit<ToastOptions, 'onClose'>> = {
  type: 'default',
  duration: 5000,
  persistent: false,
  position: 'top-right',
  animation: 'slide',
  icon: null,
  showIcon: true,
  title: '',
  description: '',
  action: undefined as any,
  className: '',
  style: {},
  closable: true,
  progress: true,
  sound: false,
};

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Custom hook
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  defaultDuration = 5000,
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = useCallback(() => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }, []);

  const playSound = useCallback(() => {
    // Create a simple notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((message: string, options: ToastOptions = {}): string => {
    const id = generateId();
    const toastOptions = {
      ...defaultToastOptions,
      position: defaultPosition,
      duration: defaultDuration,
      ...options,
    };

    const newToast: Toast = {
      id,
      message,
      createdAt: Date.now(),
      ...toastOptions,
    };

    if (toastOptions.sound) {
      try {
        playSound();
      } catch (error) {
        console.warn('Could not play toast sound:', error);
      }
    }

    setToasts(prev => {
      const filtered = prev.slice(-(maxToasts - 1));
      return [...filtered, newToast];
    });

    // Auto dismiss if not persistent
    if (!toastOptions.persistent && toastOptions.duration > 0) {
      setTimeout(() => {
        dismiss(id);
        toastOptions.onClose?.();
      }, toastOptions.duration);
    }

    return id;
  }, [generateId, defaultPosition, defaultDuration, maxToasts, dismiss, playSound]);

  const success = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return toast(message, { ...options, type: 'success' });
  }, [toast]);

  const error = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return toast(message, { ...options, type: 'error' });
  }, [toast]);

  const warning = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return toast(message, { ...options, type: 'warning' });
  }, [toast]);

  const info = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return toast(message, { ...options, type: 'info' });
  }, [toast]);

  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...options } : toast
    ));
  }, []);

  const contextValue: ToastContextType = {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    update,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  // Group toasts by position
  const groupedToasts = toasts.reduce((acc, toast) => {
    if (!acc[toast.position]) {
      acc[toast.position] = [];
    }
    acc[toast.position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, Toast[]>);

  const getPositionClasses = (position: ToastPosition): string => {
    const baseClasses = 'fixed z-50 pointer-events-none';
    const positionClasses = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    };
    return `${baseClasses} ${positionClasses[position]}`;
  };

  return (
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div key={position} className={getPositionClasses(position as ToastPosition)}>
          <div className="flex flex-col gap-2">
            {positionToasts.map(toast => (
              <ToastCard key={toast.id} toast={toast} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

// Toast Card Component
interface ToastCardProps {
  toast: Toast;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast }) => {
  const { dismiss } = useToast();
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast.persistent && toast.duration > 0 && toast.progress) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - toast.createdAt;
        const remaining = Math.max(0, (toast.duration - elapsed) / toast.duration * 100);
        setProgress(remaining);
      }, 50);

      return () => clearInterval(interval);
    }
  }, [toast]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      dismiss(toast.id);
      toast.onClose?.();
    }, 300);
  }, [dismiss, toast]);

  const getTypeStyles = (type: ToastType) => {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      default: 'bg-white border-gray-200 text-gray-800',
    };
    return styles[type];
  };

  const getProgressStyles = (type: ToastType) => {
    const styles = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
      default: 'bg-gray-500',
    };
    return styles[type];
  };

  const getTypeIcon = (type: ToastType) => {
    const icons = {
      success: <CheckCircle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />,
      default: <Bell className="w-5 h-5" />,
    };
    return icons[type];
  };

  const getAnimationClasses = (animation: ToastAnimation, isVisible: boolean, isExiting: boolean) => {
    const baseClasses = 'transition-all duration-300 ease-in-out';
    
    if (isExiting) {
      return `${baseClasses} opacity-0 scale-95 translate-x-full`;
    }

    if (!isVisible) {
      const hiddenStates = {
        slide: 'translate-x-full opacity-0',
        fade: 'opacity-0',
        bounce: 'scale-95 opacity-0',
        scale: 'scale-0 opacity-0',
      };
      return `${baseClasses} ${hiddenStates[animation]}`;
    }

    const visibleStates = {
      slide: 'translate-x-0 opacity-100',
      fade: 'opacity-100',
      bounce: 'scale-100 opacity-100',
      scale: 'scale-100 opacity-100',
    };
    return `${baseClasses} ${visibleStates[animation]}`;
  };

  return (
    <div
      className={`
        pointer-events-auto relative overflow-hidden rounded-lg border shadow-lg min-w-80 max-w-md
        ${getTypeStyles(toast.type)}
        ${getAnimationClasses(toast.animation, isVisible, isExiting)}
        ${toast.className}
      `}
      style={toast.style}
    >
      {/* Progress bar */}
      {toast.progress && !toast.persistent && (
        <div className="absolute top-0 left-0 h-1 bg-black bg-opacity-10 w-full">
          <div
            className={`h-full transition-all duration-100 ${getProgressStyles(toast.type)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          {toast.showIcon && (
            <div className="flex-shrink-0 pt-0.5">
              {toast.icon || getTypeIcon(toast.type)}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <div className="font-semibold text-sm mb-1">{toast.title}</div>
            )}
            <div className="text-sm">{toast.message}</div>
            {toast.description && (
              <div className="text-xs mt-1 opacity-75">{toast.description}</div>
            )}
          </div>

          {/* Close button */}
          {toast.closable && (
            <span
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
            >
              <X className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* Action button */}
        {toast.action && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                toast.action.onClick();
                handleDismiss();
              }}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${toast.action.variant === 'destructive' 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : toast.action.variant === 'secondary'
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {toast.action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
