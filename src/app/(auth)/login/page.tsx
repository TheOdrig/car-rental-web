import { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/features/auth';
import { FormError, OAuthButtons, OAuthDivider, oauthErrorMessage } from '@/features/auth';
import { safeRedirectPath } from '@/shared/lib';
import { ROUTES } from '@/shared/config/routes';

export const metadata: Metadata = {
    title: 'Log In',
    description: 'Log in to your Car Rental account to manage your rentals.',
};

interface LoginPageProps {
    searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const { callbackUrl, error } = await searchParams;
    const oauthError = oauthErrorMessage(error);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    Welcome Back
                </h1>
                <p className="text-muted-foreground text-base">
                    Log in to manage your rentals and your account.
                </p>
            </div>

            {oauthError && <FormError message={oauthError} />}

            <LoginForm callbackUrl={safeRedirectPath(callbackUrl)} />

            <OAuthDivider />

            <OAuthButtons callbackUrl={safeRedirectPath(callbackUrl)} />

            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href={ROUTES.register} className="font-bold text-primary hover:underline">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
}
