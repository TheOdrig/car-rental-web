'use client';

import { useCallback, useState } from 'react';
import { DynamicImage } from '@/components/ui/dynamic-image';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { useUploadPhotos, useDeletePhoto } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import type { DamagePhoto } from '@/types';

interface DamagePhotoUploadProps {
    damageId: number;
    existingPhotos: DamagePhoto[];
    onUploadSuccess?: () => void;
    maxPhotos?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
};

export function DamagePhotoUpload({
    damageId,
    existingPhotos,
    onUploadSuccess,
    maxPhotos = 10,
}: DamagePhotoUploadProps) {
    const [deletePhotoId, setDeletePhotoId] = useState<number | null>(null);
    const uploadPhotos = useUploadPhotos();
    const deletePhoto = useDeletePhoto();

    const remainingSlots = maxPhotos - existingPhotos.length;

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;
            if (acceptedFiles.length > remainingSlots) {
                return;
            }

            const formData = new FormData();
            acceptedFiles.forEach((file) => {
                formData.append('photos', file);
            });

            try {
                await uploadPhotos.mutateAsync({ damageId, formData });
                onUploadSuccess?.();
            } catch {
            }
        },
        [damageId, remainingSlots, uploadPhotos, onUploadSuccess]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: ACCEPTED_FILE_TYPES,
        maxSize: MAX_FILE_SIZE,
        maxFiles: remainingSlots,
        disabled: remainingSlots <= 0 || uploadPhotos.isPending,
    });

    const handleDeletePhoto = async () => {
        if (deletePhotoId === null) return;
        try {
            await deletePhoto.mutateAsync({ damageId, photoId: deletePhotoId });
            setDeletePhotoId(null);
        } catch {
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingPhotos.map((photo) => (
                    <Card key={photo.id} className="relative group overflow-hidden">
                        <CardContent className="p-0">
                            <div className="aspect-square relative">
                                <DynamicImage
                                    src={photo.secureUrl}
                                    alt={photo.fileName}
                                    fill
                                    className="object-cover"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => setDeletePhotoId(photo.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {remainingSlots > 0 && (
                    <div
                        {...getRootProps()}
                        className={cn(
                            'aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors',
                            isDragActive
                                ? 'border-primary bg-primary/5'
                                : 'border-muted-foreground/25 hover:border-primary/50',
                            uploadPhotos.isPending && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <input {...getInputProps()} />
                        {uploadPhotos.isPending ? (
                            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                        ) : isDragActive ? (
                            <>
                                <Upload className="h-8 w-8 text-primary mb-2" />
                                <p className="text-sm text-primary">Drop files here</p>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground text-center px-2">
                                    Drop photos or click to upload
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {remainingSlots} slot{remainingSlots !== 1 ? 's' : ''} remaining
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {fileRejections.length > 0 && (
                <p className="text-sm text-destructive">
                    Some files were rejected. Max size: 5MB, formats: JPG, PNG, WEBP
                </p>
            )}

            <p className="text-xs text-muted-foreground">
                Accepted formats: JPG, PNG, WEBP. Max size: 5MB per file. Max {maxPhotos} photos.
            </p>

            <AlertDialog open={deletePhotoId !== null} onOpenChange={() => setDeletePhotoId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this photo? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePhoto}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deletePhoto.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

