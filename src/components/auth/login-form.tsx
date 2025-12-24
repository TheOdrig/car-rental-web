'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { FormError } from './form-error';
import { validateEmail } from '@/lib/utils/validation';

interface LoginFormProps {
    callbackUrl?: string;
    className?: string;
}

export function LoginForm({ callbackUrl = '/', className }: LoginFormProps) {
    const router = useRouter();
    const loginMutation = useLogin();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [formError, setFormError] = useState<string | null>(null);

    const isUsernameValid = formData.username.trim().length > 0 &&
        (validateEmail(formData.username) || formData.username.length >= 3);
    const isPasswordValid = formData.password.length >= 6;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Email or username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!validateForm()) return;

        try {
            await loginMutation.mutateAsync({
                username: formData.username,
                password: formData.password,
            });
            router.push(callbackUrl);
        } catch {
            setFormError('Invalid credentials. Please try again.');
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (formError) {
            setFormError(null);
        }
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const getValidationIcon = (fieldName: string, isValid: boolean) => {
        if (!touched[fieldName] || !formData[fieldName as keyof typeof formData]) {
            return null;
        }
        return isValid ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
        ) : (
            <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
        );
    };

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
            <FormError
                message={formError || ''}
                onDismiss={() => setFormError(null)}
            />

            <div className="flex flex-col gap-2">
                <Label htmlFor="username">Email or Username</Label>
                <div className="relative">
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="name@example.com"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loginMutation.isPending}
                        aria-invalid={!!errors.username}
                        aria-describedby={errors.username ? 'username-error' : undefined}
                        className={cn(
                            'h-12 pr-10',
                            errors.username && 'border-destructive focus-visible:ring-destructive',
                            touched.username && isUsernameValid && 'border-green-500 focus-visible:ring-green-500'
                        )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {getValidationIcon('username', isUsernameValid)}
                    </div>
                </div>
                {errors.username && (
                    <p id="username-error" className="text-xs text-destructive" role="alert">
                        {errors.username}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        href="/forgot-password"
                        className="text-sm font-semibold text-primary hover:text-primary/80"
                    >
                        Forgot Password?
                    </Link>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={loginMutation.isPending}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        className={cn(
                            'h-12 pr-20',
                            errors.password && 'border-destructive focus-visible:ring-destructive',
                            touched.password && isPasswordValid && 'border-green-500 focus-visible:ring-green-500'
                        )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
                        {getValidationIcon('password', isPasswordValid)}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
                {errors.password && (
                    <p id="password-error" className="text-xs text-destructive" role="alert">
                        {errors.password}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full h-12 font-bold"
                disabled={loginMutation.isPending}
            >
                {loginMutation.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    'Log In'
                )}
            </Button>
        </form>
    );
}
