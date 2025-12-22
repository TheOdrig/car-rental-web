import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cn } from '@/lib/utils';
import { showToast, toastMessages } from '@/lib/utils/toast';

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
        loading: vi.fn(() => 'toast-id'),
        dismiss: vi.fn(),
        promise: vi.fn(),
    },
}));

import { toast } from 'sonner';

const mockToast = vi.mocked(toast);

describe('Utils', () => {
    describe('cn - className utility', () => {
        it('should merge single class', () => {
            expect(cn('foo')).toBe('foo');
        });

        it('should merge multiple classes', () => {
            expect(cn('foo', 'bar')).toBe('foo bar');
        });

        it('should handle conditional classes', () => {
            expect(cn('base', 'included', false)).toBe('base included');
        });

        it('should handle undefined and null', () => {
            expect(cn('base', undefined, null, 'end')).toBe('base end');
        });

        it('should merge tailwind classes correctly', () => {
            expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6');
        });

        it('should handle object syntax', () => {
            expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
        });

        it('should handle array syntax', () => {
            expect(cn(['foo', 'bar'])).toBe('foo bar');
        });

        it('should handle empty input', () => {
            expect(cn()).toBe('');
        });

        it('should deduplicate conflicting tailwind classes', () => {
            expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
        });
    });
});

describe('Toast Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('showToast.success', () => {
        it('should call toast.success with message', () => {
            showToast.success('Success message');
            expect(mockToast.success).toHaveBeenCalledWith('Success message', { description: undefined });
        });

        it('should call toast.success with message and description', () => {
            showToast.success('Success message', 'Additional details');
            expect(mockToast.success).toHaveBeenCalledWith('Success message', { description: 'Additional details' });
        });
    });

    describe('showToast.error', () => {
        it('should call toast.error with message', () => {
            showToast.error('Error message');
            expect(mockToast.error).toHaveBeenCalledWith('Error message', { description: undefined });
        });

        it('should call toast.error with message and description', () => {
            showToast.error('Error message', 'Error details');
            expect(mockToast.error).toHaveBeenCalledWith('Error message', { description: 'Error details' });
        });
    });

    describe('showToast.warning', () => {
        it('should call toast.warning with message', () => {
            showToast.warning('Warning message');
            expect(mockToast.warning).toHaveBeenCalledWith('Warning message', { description: undefined });
        });
    });

    describe('showToast.info', () => {
        it('should call toast.info with message', () => {
            showToast.info('Info message');
            expect(mockToast.info).toHaveBeenCalledWith('Info message', { description: undefined });
        });
    });

    describe('showToast.loading', () => {
        it('should call toast.loading and return toast id', () => {
            const result = showToast.loading('Loading...');
            expect(mockToast.loading).toHaveBeenCalledWith('Loading...');
            expect(result).toBe('toast-id');
        });
    });

    describe('showToast.dismiss', () => {
        it('should call toast.dismiss without id', () => {
            showToast.dismiss();
            expect(mockToast.dismiss).toHaveBeenCalledWith(undefined);
        });

        it('should call toast.dismiss with specific id', () => {
            showToast.dismiss('toast-123');
            expect(mockToast.dismiss).toHaveBeenCalledWith('toast-123');
        });
    });

    describe('showToast.promise', () => {
        it('should call toast.promise with promise and messages', () => {
            const promise = Promise.resolve('data');
            const messages = {
                loading: 'Loading...',
                success: 'Done!',
                error: 'Failed!',
            };

            showToast.promise(promise, messages);
            expect(mockToast.promise).toHaveBeenCalledWith(promise, messages);
        });
    });
});

describe('toastMessages', () => {
    describe('rental messages', () => {
        it('should have all rental messages defined', () => {
            expect(toastMessages.rental.createSuccess).toBe('Rental request submitted successfully!');
            expect(toastMessages.rental.createError).toBe('Failed to create rental request');
            expect(toastMessages.rental.cancelSuccess).toBe('Rental cancelled successfully');
            expect(toastMessages.rental.cancelError).toBe('Failed to cancel rental');
            expect(toastMessages.rental.approveSuccess).toBe('Rental approved successfully');
            expect(toastMessages.rental.approveError).toBe('Failed to approve rental');
            expect(toastMessages.rental.pickupSuccess).toBe('Pickup processed successfully');
            expect(toastMessages.rental.pickupError).toBe('Failed to process pickup');
            expect(toastMessages.rental.returnSuccess).toBe('Return processed successfully');
            expect(toastMessages.rental.returnError).toBe('Failed to process return');
        });
    });

    describe('auth messages', () => {
        it('should have all auth messages defined', () => {
            expect(toastMessages.auth.loginSuccess).toBe('Welcome back!');
            expect(toastMessages.auth.loginError).toBe('Invalid credentials');
            expect(toastMessages.auth.logoutSuccess).toBe('Logged out successfully');
            expect(toastMessages.auth.registerSuccess).toBe('Account created successfully!');
            expect(toastMessages.auth.registerError).toBe('Failed to create account');
        });
    });

    describe('generic messages', () => {
        it('should have all generic messages defined', () => {
            expect(toastMessages.generic.saveSuccess).toBe('Changes saved successfully');
            expect(toastMessages.generic.saveError).toBe('Failed to save changes');
            expect(toastMessages.generic.deleteSuccess).toBe('Deleted successfully');
            expect(toastMessages.generic.deleteError).toBe('Failed to delete');
            expect(toastMessages.generic.loadError).toBe('Failed to load data');
            expect(toastMessages.generic.networkError).toBe('Network error. Please check your connection.');
            expect(toastMessages.generic.unexpectedError).toBe('An unexpected error occurred');
        });
    });
});
