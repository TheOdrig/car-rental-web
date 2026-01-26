'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { FormError } from './form-error';

interface ForgotPasswordFormProps {
    className?: string;
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
    const forgotPassword = useForgotPassword();

    const [email, setEmail] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!email.trim()) {
            setFormError('Email is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setFormError('Please enter a valid email address');
            return;
        }

        try {
            await forgotPassword.mutateAsync({ email });
            setIsSubmitted(true);
        } catch {
        }
    };

    if (isSubmitted) {
        return (
            <div className={cn('space-y-6', className)}>
                <div className="flex flex-col items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950/50">
                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
                            Check your email
                        </h2>
                        <p className="text-sm text-green-700 dark:text-green-300">
                            We&apos;ve sent a password reset link to{' '}
                            <span className="font-medium">{email}</span>
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                            The link will expire in 1 hour
                        </p>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100"
                    onClick={() => {
                        setIsSubmitted(false);
                        setEmail('');
                    }}
                >
                    Send another link
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
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (formError) setFormError(null);
                        }}
                        disabled={forgotPassword.isPending}
                        className="h-12 pl-10"
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 font-bold"
                disabled={forgotPassword.isPending}
            >
                {forgotPassword.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    'Send Reset Link'
                )}
            </Button>
        </form>
    );
}

