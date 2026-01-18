'use client';

import { useState, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { useLogin } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { FormError } from './form-error';
import { validateEmail } from '@/lib/utils/validation';
import { determineValidationState } from '@/lib/utils/validation-ui';
import type { ValidationState } from '@/types/validation';

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
    const [focused, setFocused] = useState<Record<string, boolean>>({});
    const [formError, setFormError] = useState<string | null>(null);

    const isUsernameValid = formData.username.trim().length > 0 &&
        (validateEmail(formData.username) || formData.username.length >= 3);
    const isPasswordValid = formData.password.length >= 6;

    const usernameValidationState: ValidationState = useMemo(() =>
        determineValidationState({
            value: formData.username,
            error: errors.username,
            isTouched: touched.username,
            isFocused: focused.username,
            isDisabled: loginMutation.isPending,
            isRequired: true,
            isValid: isUsernameValid,
        }), [formData.username, errors.username, touched.username, focused.username, loginMutation.isPending, isUsernameValid]
    );

    const passwordValidationState: ValidationState = useMemo(() =>
        determineValidationState({
            value: formData.password,
            error: errors.password,
            isTouched: touched.password,
            isFocused: focused.password,
            isDisabled: loginMutation.isPending,
            isRequired: true,
            isValid: isPasswordValid,
        }), [formData.password, errors.password, touched.password, focused.password, loginMutation.isPending, isPasswordValid]
    );

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

        setTouched({ username: true, password: true });

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

    const handleFocus = (e: ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setFocused(prev => ({ ...prev, [name]: true }));
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setFocused(prev => ({ ...prev, [name]: false }));
    };

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
            <FormError
                message={formError || ''}
                onDismiss={() => setFormError(null)}
            />

            <FormField
                label="Email or Username"
                htmlFor="username"
                error={errors.username}
                required
                validationState={usernameValidationState}
                isDisabled={loginMutation.isPending}
            >
                <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={loginMutation.isPending}
                    validationState={usernameValidationState}
                    className="h-12 pr-10"
                />
            </FormField>

            <FormField
                label="Password"
                htmlFor="password"
                error={errors.password}
                required
                validationState={passwordValidationState}
                isDisabled={loginMutation.isPending}
                description={
                    <Link
                        href="/forgot-password"
                        className="text-sm font-semibold text-primary hover:text-primary/80"
                    >
                        Forgot Password?
                    </Link>
                }
            >
                <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={loginMutation.isPending}
                        validationState={passwordValidationState}
                        className="h-12 pr-20"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-10 flex items-center px-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </FormField>

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
