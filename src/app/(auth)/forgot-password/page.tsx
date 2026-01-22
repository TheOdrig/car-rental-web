import { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
    title: 'Forgot Password | CarRental',
    description: 'Reset your CarRental account password. Enter your email to receive a password reset link.',
};

export default function ForgotPasswordPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    Forgot Password?
                </h1>
                <p className="text-muted-foreground text-base">
                    No worries! Enter your email and we&apos;ll send you a reset link.
                </p>
            </div>

            <ForgotPasswordForm />

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
