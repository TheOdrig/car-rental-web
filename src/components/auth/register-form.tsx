'use client';

import { useState, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/lib/hooks';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
    className?: string;
}

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengths: PasswordStrength[] = [
        { score: 0, label: 'Too weak', color: 'bg-destructive' },
        { score: 1, label: 'Weak', color: 'bg-destructive' },
        { score: 2, label: 'Fair', color: 'bg-yellow-500' },
        { score: 3, label: 'Good', color: 'bg-green-500' },
        { score: 4, label: 'Strong', color: 'bg-green-600' },
    ];

    return strengths[score];
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

    const passwordStrength = useMemo(
        () => getPasswordStrength(formData.password),
        [formData.password]
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
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
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

        if (!validateForm()) return;

        try {
            await registerMutation.mutateAsync({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            router.push('/');
        } catch {
            setErrors({
                form: 'Registration failed. Please try again.',
            });
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

    return (
        <form onSubmit={handleSubmit} className={cn('space-y-5', className)}>
            {errors.form && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {errors.form}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="e.g. johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={registerMutation.isPending}
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={registerMutation.isPending}
                    aria-invalid={!!errors.email}
                    className={cn(
                        'h-12',
                        errors.email && 'border-destructive focus-visible:ring-destructive'
                    )}
                />
                {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
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
                        disabled={registerMutation.isPending}
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
                {formData.password && (
                    <>
                        <div className="flex gap-1 h-1 w-full">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={cn(
                                        'h-full flex-1 rounded-full transition-colors',
                                        level <= passwordStrength.score
                                            ? passwordStrength.color
                                            : 'bg-muted'
                                    )}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Password strength: {passwordStrength.label}
                        </p>
                    </>
                )}
                {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
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
                        disabled={registerMutation.isPending}
                        aria-invalid={!!errors.confirmPassword}
                        className={cn(
                            'h-12 pr-10',
                            errors.confirmPassword && 'border-destructive focus-visible:ring-destructive',
                            passwordsMatch && 'border-green-500 focus-visible:ring-green-500'
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                        {formData.confirmPassword ? (
                            passwordsMatch ? (
                                <Check className="h-5 w-5 text-green-500" />
                            ) : (
                                <X className="h-5 w-5 text-destructive" />
                            )
                        ) : showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword}</p>
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
                        <p className="text-xs text-destructive mt-1">{errors.terms}</p>
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
