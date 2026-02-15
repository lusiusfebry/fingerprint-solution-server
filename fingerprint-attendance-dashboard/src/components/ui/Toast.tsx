import toast, { ToastOptions } from 'react-hot-toast';

// Helper functions to normalize toast usage
export const showToast = {
    success: (message: string, options?: ToastOptions) => toast.success(message, {
        duration: 3000,
        position: 'top-right',
        style: { background: '#10B981', color: '#fff' },
        ...options
    }),
    error: (message: string, options?: ToastOptions) => toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: { background: '#EF4444', color: '#fff' },
        ...options
    }),
    info: (message: string, options?: ToastOptions) => toast(message, {
        icon: 'ℹ️',
        duration: 3000,
        position: 'top-right',
        style: { background: '#3B82F6', color: '#fff' },
        ...options
    }),
    warning: (message: string, options?: ToastOptions) => toast(message, {
        icon: '⚠️',
        duration: 3000,
        position: 'top-right',
        style: { background: '#F59E0B', color: '#fff' },
        ...options
    })
};
