import { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { OAuthButtons, OAuthDivider } from '@/components/auth/oauth-buttons';

export const metadata: Metadata = {
    title: 'Login | CarRental',
    description: 'Sign in to your CarRental account to manage your rentals and access exclusive deals.',
};

interface LoginPageProps {
    searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const { callbackUrl } = await searchParams;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    Welcome Back
                </h1>
                <p className="text-muted-foreground text-base">
                    Sign in to manage your fleet and access exclusive deals.
                </p>
            </div>

            <LoginForm callbackUrl={callbackUrl || '/'} />

            <OAuthDivider />

            <OAuthButtons />

            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-bold text-primary hover:underline">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
}

