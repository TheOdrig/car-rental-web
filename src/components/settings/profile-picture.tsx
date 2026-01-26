'use client';

import { useRef, useCallback, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { validateAvatarFile } from '@/lib/hooks/use-avatar';
import { showToast } from '@/lib/utils/toast';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

function normalizeAvatarUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    if (url.startsWith('/')) {
        return `${BACKEND_URL}${url}`;
    }

    return `${BACKEND_URL}/${url}`;
}

interface ProfilePictureProps {
    avatarUrl?: string | null;
    onUpload: (file: File) => Promise<void>;
    onDelete: () => Promise<void>;
    isUploading?: boolean;
    isDeleting?: boolean;
    className?: string;
}

export function ProfilePicture({
    avatarUrl,
    onUpload,
    onDelete,
    isUploading = false,
    isDeleting = false,
    className,
}: ProfilePictureProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = useCallback(() => {
        if (!isUploading && !isDeleting) {
            inputRef.current?.click();
        }
    }, [isUploading, isDeleting]);

    const handleChange = useCallback(
        async (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const validationError = validateAvatarFile(file);
            if (validationError) {
                showToast.error(validationError.message);
                return;
            }

            await onUpload(file);

            if (inputRef.current) {
                inputRef.current.value = '';
            }
        },
        [onUpload]
    );

    const handleRemove = useCallback(async () => {
        await onDelete();
    }, [onDelete]);

    const isLoading = isUploading || isDeleting;

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            <div className="group relative">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg">
                    {normalizeAvatarUrl(avatarUrl) ? (
                        <Image
                            src={normalizeAvatarUrl(avatarUrl)!}
                            alt="Profile picture"
                            fill
                            className="object-cover"
                            sizes="128px"
                            unoptimized
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <span className="text-4xl font-bold text-muted-foreground">
                                ?
                            </span>
                        </div>
                    )}

                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleClick}
                    disabled={isLoading}
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                    aria-label="Change profile picture"
                >
                    <Camera className="h-5 w-5" />
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleChange}
                className="hidden"
                aria-label="Upload profile picture"
                disabled={isLoading}
            />

            {normalizeAvatarUrl(avatarUrl) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive hover:!bg-destructive/10 dark:hover:!bg-destructive/20"
                >
                    {isDeleting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Remove Photo
                </Button>
            )}
        </div>
    );
}

