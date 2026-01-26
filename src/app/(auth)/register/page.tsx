import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';
import { OAuthButtons, OAuthDivider } from '@/components/auth/oauth-buttons';

export const metadata: Metadata = {
    title: 'Register | CarRental',
    description: 'Create a CarRental account to start booking your perfect ride.',
};

export default function RegisterPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    Start your journey
                </h1>
                <p className="text-muted-foreground text-base">
                    Create an account to unlock exclusive deals.
                </p>
            </div>

            <OAuthButtons />

            <OAuthDivider text="Or continue with email" />

            <RegisterForm />
        </div>
    );
}

