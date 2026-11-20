import { Metadata } from 'next';
import { RegisterForm } from '@/features/auth';
import { OAuthButtons, OAuthDivider } from '@/features/auth';

export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create a Car Rental account to request rentals and track them in one place.',
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
