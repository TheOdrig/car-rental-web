import { toast } from 'sonner';

export const showToast = {
    success: (message: string, description?: string) => {
        toast.success(message, { description });
    },

    error: (message: string, description?: string, onRetry?: () => void) => {
        toast.error(message, {
            description,
            action: onRetry ? {
                label: 'Retry',
                onClick: onRetry,
            } : undefined,
        });
    },

    warning: (message: string, description?: string) => {
        toast.warning(message, { description });
    },

    info: (message: string, description?: string) => {
        toast.info(message, { description });
    },

    loading: (message: string) => {
        return toast.loading(message);
    },

    dismiss: (toastId?: string | number) => {
        toast.dismiss(toastId);
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: Error) => string);
        }
    ) => {
        return toast.promise(promise, messages);
    },
};

export const toastMessages = {
    rental: {
        createSuccess: 'Rental request submitted successfully!',
        createError: 'Failed to create rental request',
        cancelSuccess: 'Rental cancelled successfully',
        cancelError: 'Failed to cancel rental',
        approveSuccess: 'Rental approved successfully',
        approveError: 'Failed to approve rental',
        pickupSuccess: 'Pickup processed successfully',
        pickupError: 'Failed to process pickup',
        returnSuccess: 'Return processed successfully',
        returnError: 'Failed to process return',
        rejectSuccess: 'Rental request rejected',
        rejectError: 'Failed to reject rental',
    },
    auth: {
        loginSuccess: 'Welcome back!',
        loginError: 'Invalid credentials',
        logoutSuccess: 'Logged out successfully',
        registerSuccess: 'Account created successfully!',
        registerError: 'Failed to create account',
    },
    generic: {
        saveSuccess: 'Changes saved successfully',
        saveError: 'Failed to save changes',
        deleteSuccess: 'Deleted successfully',
        deleteError: 'Failed to delete',
        loadError: 'Failed to load data',
        networkError: 'Network error. Please check your connection.',
        unexpectedError: 'An unexpected error occurred',
    },
};
