'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { FormField } from '@/shared/ui/form-field';
import { getFormErrorMessage } from '@/shared/api';
import { useRegister } from '../lib/use-auth';
import { cn } from '@/shared/lib';
import { FormError } from './form-error';
import { focusFirstInvalid } from '../lib/focus-first-invalid';
import { PasswordStrengthIndicator } from './password-strength-indicator';
import { getPasswordMaxError, normalizeEmail, validateEmail, validatePassword, validatePasswordMatch } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';

interface RegisterFormProps {
    className?: string;
}

export function RegisterForm({ className }: RegisterFormProps) {
    const router = useRouter();
    const registerMutation = useRegister();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);

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
        } else if (getPasswordMaxError(formData.password)) {
            newErrors.password = getPasswordMaxError(formData.password)!;
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
        const valid = Object.keys(newErrors).length === 0;
        if (!valid) focusFirstInvalid(['username', 'email', 'password', 'confirmPassword', 'terms'], newErrors);
        return valid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!validateForm()) return;

        try {
            await registerMutation.mutateAsync({
                username: formData.username,
                email: normalizeEmail(formData.email),
                password: formData.password,
                firstName: formData.firstName || undefined,
                lastName: formData.lastName || undefined,
            });
            router.push(ROUTES.home);
        } catch (error) {
            setFormError(getFormErrorMessage(error, 'Registration failed. Please try again.'));
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

    return (
        <form noValidate onSubmit={handleSubmit} className={cn('space-y-5', className)}>
            <FormError
                focusOnShow
                message={formError || ''}
                onDismiss={() => setFormError(null)}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    label="First Name"
                    htmlFor="firstName"
                    isDisabled={registerMutation.isPending}
                >
                    <Input
                        id="firstName"
                        autoComplete="given-name"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={registerMutation.isPending}
                        className="h-12"
                    />
                </FormField>

                <FormField
                    label="Last Name"
                    htmlFor="lastName"
                    isDisabled={registerMutation.isPending}
                >
                    <Input
                        id="lastName"
                        autoComplete="family-name"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={registerMutation.isPending}
                        className="h-12"
                    />
                </FormField>
            </div>

            <FormField
                label="Username"
                htmlFor="username"
                error={errors.username}
                required
                isDisabled={registerMutation.isPending}
            >
                <Input
                    id="username"
                    autoComplete="username"
                    name="username"
                    type="text"
                    placeholder="e.g. johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={() => setErrors(prev => ({ ...prev, username: formData.username ? '' : 'Username is required' }))}
                    disabled={registerMutation.isPending}
                    error={errors.username}
                    success={formData.username.length >= 3 && !errors.username ? 'Valid!' : undefined}
                    className="h-12 pr-10"
                />
            </FormField>

            <FormField
                label="Email Address"
                htmlFor="email"
                error={errors.email}
                required
                isDisabled={registerMutation.isPending}
            >
                <Input
                    id="email"
                    autoComplete="email"
                    name="email"
                    type="text"
                    inputMode="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => setErrors(prev => ({ ...prev, email: validateEmail(formData.email) ? '' : 'Please enter a valid email address' }))}
                    disabled={registerMutation.isPending}
                    error={errors.email}
                    success={validateEmail(formData.email) && !errors.email ? 'Valid!' : undefined}
                    className="h-12 pr-10"
                />
            </FormField>

            <FormField
                label="Password"
                htmlFor="password"
                error={errors.password}
                required
                isDisabled={registerMutation.isPending}
                showIcon={false}
            >
                <div className="relative">
                    <Input
                        id="password"
                        autoComplete="new-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => setErrors(prev => ({ ...prev, password: formData.password.length >= 8 ? '' : 'Password must be at least 8 characters' }))}
                        disabled={registerMutation.isPending}
                        error={errors.password}
                        className="h-12 pr-12"
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
            </FormField>

            <FormField
                label="Confirm Password"
                htmlFor="confirmPassword"
                error={errors.confirmPassword}
                required
                isDisabled={registerMutation.isPending}
            >
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        autoComplete="new-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => setErrors(prev => ({ ...prev, confirmPassword: formData.password === formData.confirmPassword ? '' : 'Passwords do not match' }))}
                        disabled={registerMutation.isPending}
                        error={errors.confirmPassword}
                        success={formData.password === formData.confirmPassword && formData.confirmPassword !== '' ? 'Match!' : undefined}
                        className="h-12 pr-20"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-10 flex items-center px-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </FormField>

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
                        <Link
                            href={ROUTES.terms}
                            target="_blank"
                            rel="noopener"
                            className="text-primary hover:underline"
                        >
                            Terms of Service<span className="sr-only"> (opens in a new tab)</span>
                        </Link>{' '}
                        and{' '}
                        <Link
                            href={ROUTES.privacy}
                            target="_blank"
                            rel="noopener"
                            className="text-primary hover:underline"
                        >
                            Privacy Policy<span className="sr-only"> (opens in a new tab)</span>
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
                    <Link href={ROUTES.login} className="font-bold text-primary hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </form>
    );
}
