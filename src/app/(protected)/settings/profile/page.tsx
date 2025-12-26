'use client';

import { useCurrentUser } from '@/lib/hooks';
import { ProfilePicture, PersonalDetailsForm } from '@/components/settings';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileSettingsPage() {
    const { user, isLoading } = useCurrentUser();

    if (isLoading) {
        return <ProfileSettingsSkeleton />;
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="flex flex-col items-center py-8 sm:flex-row sm:gap-8">
                    <ProfilePicture
                        onImageChange={(file) => {
                            console.log('Image changed:', file);
                        }}
                    />
                    <div className="mt-4 text-center sm:mt-0 sm:text-left">
                        <h2 className="text-xl font-semibold">{user?.username || 'User'}</h2>
                        <p className="text-muted-foreground">{user?.email || 'No email'}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Member since {new Date().getFullYear()}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <PersonalDetailsForm
                initialData={{
                    firstName: '',
                    lastName: '',
                    phone: '',
                }}
                email={user?.email || ''}
                emailVerified={true}
                onSubmit={async (data) => {
                    console.log('Submitting:', data);
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }}
            />
        </div>
    );
}

function ProfileSettingsSkeleton() {
    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="flex flex-col items-center py-8 sm:flex-row sm:gap-8">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <div className="mt-4 space-y-2 sm:mt-0">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="space-y-4 py-6">
                    <Skeleton className="h-6 w-40" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
