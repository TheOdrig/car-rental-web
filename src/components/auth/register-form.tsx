'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Eye, EyeOff, Loader2, CheckCircle2, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { FormError } from './form-error';
import { PasswordStrengthIndicator } from './password-strength-indicator';
import { validateEmail, validatePassword, validatePasswordMatch } from '@/lib/utils/validation';

interface RegisterFormProps {
    className?: string;
}

export function RegisterForm({ className }: RegisterFormProps) {
    const router = useRouter();
    const registerMutation = useRegister();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [formError, setFormError] = useState<string | null>(null);

    const isUsernameValid = formData.username.length >= 3;
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);
    const isConfirmPasswordValid = validatePasswordMatch(formData.password, formData.confirmPassword) && formData.confirmPassword.length > 0;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!acceptedTerms) {
            newErrors.terms = 'You must accept the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!validateForm()) return;

        try {
            await registerMutation.mutateAsync({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            router.push('/');
        } catch {
            setFormError('Registration failed. Please try again.');
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
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="e.g. johndoe"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={registerMutation.isPending}
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
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={registerMutation.isPending}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={cn(
                            'h-12 pr-10',
                            errors.email && 'border-destructive focus-visible:ring-destructive',
                            touched.email && isEmailValid && 'border-green-500 focus-visible:ring-green-500'
                        )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {getValidationIcon('email', isEmailValid)}
                    </div>
                </div>
                {errors.email && (
                    <p id="email-error" className="text-xs text-destructive" role="alert">
                        {errors.email}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={registerMutation.isPending}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        className={cn(
                            'h-12 pr-10',
                            errors.password && 'border-destructive focus-visible:ring-destructive',
                            touched.password && isPasswordValid && 'border-green-500 focus-visible:ring-green-500'
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
                <PasswordStrengthIndicator password={formData.password} showSuggestions={false} />
                {errors.password && (
                    <p id="password-error" className="text-xs text-destructive" role="alert">
                        {errors.password}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={registerMutation.isPending}
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                        className={cn(
                            'h-12 pr-10',
                            errors.confirmPassword && 'border-destructive focus-visible:ring-destructive',
                            touched.confirmPassword && isConfirmPasswordValid && 'border-green-500 focus-visible:ring-green-500'
                        )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
                        {getValidationIcon('confirmPassword', isConfirmPasswordValid)}
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
                {errors.confirmPassword && (
                    <p id="confirm-password-error" className="text-xs text-destructive" role="alert">
                        {errors.confirmPassword}
                    </p>
                )}
            </div>

            <div className="flex items-start gap-3">
                <input
                    id="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (errors.terms) {
                            setErrors(prev => ({ ...prev, terms: '' }));
                        }
                    }}
                    disabled={registerMutation.isPending}
                    className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    aria-describedby={errors.terms ? 'terms-error' : undefined}
                />
                <div className="text-sm">
                    <label htmlFor="terms" className="text-foreground">
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>
                    </label>
                    {errors.terms && (
                        <p id="terms-error" className="text-xs text-destructive mt-1" role="alert">
                            {errors.terms}
                        </p>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 font-bold"
                disabled={registerMutation.isPending}
            >
                {registerMutation.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    'Create Account'
                )}
            </Button>

            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-primary hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </form>
    );
}
