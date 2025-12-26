'use client';

import { useState, useRef, useCallback, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/utils/toast';

interface ProfilePictureProps {
    currentImage?: string;
    onImageChange?: (file: File | null) => void;
    className?: string;
}

export function ProfilePicture({
    currentImage,
    onImageChange,
    className,
}: ProfilePictureProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const handleChange = useCallback(
        async (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast.error('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showToast.error('Image must be less than 5MB');
                return;
            }

            setIsUploading(true);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);

            onImageChange?.(file);
        },
        [onImageChange]
    );

    const handleRemove = useCallback(() => {
        setPreview(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        onImageChange?.(null);
        showToast.success('Profile picture removed');
    }, [onImageChange]);

    const displayImage = preview || currentImage;

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            <div className="group relative">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-lg">
                    {displayImage ? (
                        <Image
                            src={displayImage}
                            alt="Profile picture"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <span className="text-4xl font-bold text-muted-foreground">
                                ?
                            </span>
                        </div>
                    )}

                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleClick}
                    className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110"
                    aria-label="Change profile picture"
                >
                    <Camera className="h-5 w-5" />
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                aria-label="Upload profile picture"
            />

            {displayImage && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Photo
                </Button>
            )}
        </div>
    );
}
