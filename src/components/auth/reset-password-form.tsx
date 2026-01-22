'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResetPassword } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { FormError } from './form-error';

interface ResetPasswordFormProps {
    token: string;
    className?: string;
}

export function ResetPasswordForm({ token, className }: ResetPasswordFormProps) {
    const router = useRouter();
    const resetPassword = useResetPassword();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!formData.newPassword) {
            setFormError('New password is required');
            return;
        }

        if (formData.newPassword.length < 8) {
            setFormError('Password must be at least 8 characters');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }

        try {
            await resetPassword.mutateAsync({
                token,
                newPassword: formData.newPassword,
            });
            setIsSuccess(true);
        } catch {
        }
    };

    if (isSuccess) {
        return (
            <div className={cn('space-y-6', className)}>
                <div className="flex flex-col items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950/50">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
                            Password Reset Successful
                        </h2>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            Your password has been reset successfully.
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    className="w-full h-12 font-bold"
                    onClick={() => router.push('/login')}
                >
                    Continue to Login
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
            <FormError
                message={formError || ''}
                onDismiss={() => setFormError(null)}
            />

            <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, newPassword: e.target.value }));
                            if (formError) setFormError(null);
                        }}
                        disabled={resetPassword.isPending}
                        className="h-12 pl-10 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                    >
                        {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                            setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                            if (formError) setFormError(null);
                        }}
                        disabled={resetPassword.isPending}
                        className="h-12 pl-10 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 font-bold"
                disabled={resetPassword.isPending}
            >
                {resetPassword.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                    </>
                ) : (
                    'Reset Password'
                )}
            </Button>
        </form>
    );
}
