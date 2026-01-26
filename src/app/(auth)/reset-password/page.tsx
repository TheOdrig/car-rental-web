import { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
    title: 'Reset Password | CarRental',
    description: 'Create a new password for your CarRental account.',
};

interface ResetPasswordPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const { token } = await searchParams;

    if (!token) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-destructive">
                        Invalid Reset Link
                    </h1>
                    <p className="text-muted-foreground text-base">
                        This password reset link is invalid or has expired.
                    </p>
                </div>

                <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Need a new reset link?{' '}
                        <Link href="/forgot-password" className="font-bold text-primary hover:underline">
                            Request password reset
                        </Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Or{' '}
                        <Link href="/login" className="font-bold text-primary hover:underline">
                            Back to login
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    Reset Password
                </h1>
                <p className="text-muted-foreground text-base">
                    Enter your new password below.
                </p>
            </div>

            <ResetPasswordForm token={token} />

            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <Link href="/login" className="font-bold text-primary hover:underline">
                        Back to login
                    </Link>
                </p>
            </div>
        </div>
    );
}

