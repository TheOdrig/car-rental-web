'use client';

import { useProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from '@/lib/hooks';
import { ProfilePicture, PersonalDetailsForm } from '@/components/settings';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { ProfileFormData } from '@/lib/validations/settings';

export default function ProfileSettingsPage() {
    const { data: profile, isLoading, error, refetch } = useProfile();
    const updateProfile = useUpdateProfile();
    const uploadAvatar = useUploadAvatar();
    const deleteAvatar = useDeleteAvatar();

    const handleProfileUpdate = async (data: ProfileFormData) => {
        await updateProfile.mutateAsync({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || undefined,
        });
    };

    const handleAvatarUpload = async (file: File) => {
        await uploadAvatar.mutateAsync(file);
    };

    const handleAvatarDelete = async () => {
        await deleteAvatar.mutateAsync();
    };

    if (isLoading) {
        return <ProfileSettingsSkeleton />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error loading profile</AlertTitle>
                    <AlertDescription>
                        {error.message || 'Failed to load profile data. Please try again.'}
                    </AlertDescription>
                </Alert>
                <Button onClick={() => refetch()}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="flex flex-col items-center py-8 sm:flex-row sm:gap-8">
                    <ProfilePicture
                        avatarUrl={profile?.avatarUrl}
                        onUpload={handleAvatarUpload}
                        onDelete={handleAvatarDelete}
                        isUploading={uploadAvatar.isPending}
                        isDeleting={deleteAvatar.isPending}
                    />
                    <div className="mt-4 text-center sm:mt-0 sm:text-left">
                        <h2 className="text-xl font-semibold">
                            {profile?.firstName && profile?.lastName
                                ? `${profile.firstName} ${profile.lastName}`
                                : profile?.username || 'User'}
                        </h2>
                        <p className="text-muted-foreground">{profile?.email || 'No email'}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            @{profile?.username}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <PersonalDetailsForm
                key={profile?.id}
                initialData={{
                    firstName: profile?.firstName || '',
                    lastName: profile?.lastName || '',
                    phone: profile?.phone,
                }}
                email={profile?.email}
                emailVerified={true}
                onSubmit={handleProfileUpdate}
                isSubmitting={updateProfile.isPending}
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
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}
