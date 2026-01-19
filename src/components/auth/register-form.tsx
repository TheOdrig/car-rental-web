'use client';

import { useState, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { useRegister } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { FormError } from './form-error';
import { PasswordStrengthIndicator } from './password-strength-indicator';
import { validateEmail, validatePassword, validatePasswordMatch } from '@/lib/utils/validation';
import { determineValidationState } from '@/lib/utils/validation-ui';
import type { ValidationState } from '@/types/validation';

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
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [focused, setFocused] = useState<Record<string, boolean>>({});
    const [formError, setFormError] = useState<string | null>(null);

    const isUsernameValid = formData.username.length >= 3;
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);
    const isConfirmPasswordValid = validatePasswordMatch(formData.password, formData.confirmPassword) && formData.confirmPassword.length > 0;

    const usernameValidationState: ValidationState = useMemo(() =>
        determineValidationState({
            value: formData.username,
            error: errors.username,
            isTouched: touched.username,
            isFocused: focused.username,
            isDisabled: registerMutation.isPending,
            isRequired: true,
            isValid: isUsernameValid,
        }), [formData.username, errors.username, touched.username, focused.username, registerMutation.isPending, isUsernameValid]
    );

    const emailValidationState: ValidationState = useMemo(() =>
        determineValidationState({
            value: formData.email,
            error: errors.email,
            isTouched: touched.email,
            isFocused: focused.email,
            isDisabled: registerMutation.isPending,
            isRequired: true,
            isValid: isEmailValid,
        }), [formData.email, errors.email, touched.email, focused.email, registerMutation.isPending, isEmailValid]
    );

    const passwordValidationState: ValidationState = useMemo(() =>
        determineValidationState({
            value: formData.password,
            error: errors.password,
            isTouched: touched.password,
            isFocused: focused.password,
            isDisabled: registerMutation.isPending,
            isRequired: true,
            isValid: isPasswordValid,
        }), [formData.password, errors.password, touched.password, focused.password, registerMutation.isPending, isPasswordValid]
    );

    const confirmPasswordValidationState: ValidationState = useMemo(() =>
        determineValidationState({
            value: formData.confirmPassword,
            error: errors.confirmPassword,
            isTouched: touched.confirmPassword,
            isFocused: focused.confirmPassword,
            isDisabled: registerMutation.isPending,
            isRequired: true,
            isValid: isConfirmPasswordValid,
        }), [formData.confirmPassword, errors.confirmPassword, touched.confirmPassword, focused.confirmPassword, registerMutation.isPending, isConfirmPasswordValid]
    );

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

        setTouched({
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            password: true,
            confirmPassword: true
        });

        if (!validateForm()) return;

        try {
            await registerMutation.mutateAsync({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName || undefined,
                lastName: formData.lastName || undefined,
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

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    label="First Name"
                    htmlFor="firstName"
                    isDisabled={registerMutation.isPending}
                >
                    <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
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
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
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
                validationState={usernameValidationState}
                isDisabled={registerMutation.isPending}
            >
                <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="e.g. johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={registerMutation.isPending}
                    validationState={usernameValidationState}
                    className="h-12 pr-10"
                />
            </FormField>

            <FormField
                label="Email Address"
                htmlFor="email"
                error={errors.email}
                required
                validationState={emailValidationState}
                isDisabled={registerMutation.isPending}
            >
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={registerMutation.isPending}
                    validationState={emailValidationState}
                    className="h-12 pr-10"
                />
            </FormField>

            <FormField
                label="Password"
                htmlFor="password"
                error={errors.password}
                required
                validationState={passwordValidationState}
                isDisabled={registerMutation.isPending}
                showIcon={false}
            >
                <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={registerMutation.isPending}
                        validationState={passwordValidationState}
                        className="h-12 pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
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
                validationState={confirmPasswordValidationState}
                isDisabled={registerMutation.isPending}
            >
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={registerMutation.isPending}
                        validationState={confirmPasswordValidationState}
                        className="h-12 pr-20"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-10 flex items-center px-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
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
                    <label htmlFor="terms" className="text-slate-900 dark:text-slate-100">
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
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-primary hover:underline">
                        Log In
                    </Link>
                </p>
            </div>
        </form>
    );
}
