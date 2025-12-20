'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/lib/hooks';
import { cn } from '@/lib/utils';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await loginMutation.mutateAsync({
                username: formData.username,
                password: formData.password,
            });
            router.push(callbackUrl);
        } catch {
            setErrors({
                form: 'Invalid credentials. Please try again.',
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
            {errors.form && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {errors.form}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <Label htmlFor="username">Email or Username</Label>
                <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loginMutation.isPending}
                    aria-invalid={!!errors.username}
                    className={cn(
                        'h-12',
                        errors.username && 'border-destructive focus-visible:ring-destructive'
                    )}
                />
                {errors.username && (
                    <p className="text-xs text-destructive">{errors.username}</p>
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
                        disabled={loginMutation.isPending}
                        aria-invalid={!!errors.password}
                        className={cn(
                            'h-12 pr-10',
                            errors.password && 'border-destructive focus-visible:ring-destructive'
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
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
