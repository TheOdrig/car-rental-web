'use client';

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageFile {
    id: string;
    file?: File;
    url: string;
    name: string;
    isExisting?: boolean;
}

interface ImagesSectionProps {
    images: ImageFile[];
    onImagesChange: (images: ImageFile[]) => void;
    maxImages?: number;
    isUploading?: boolean;
}

export function ImagesSection({
    images,
    onImagesChange,
    maxImages = 10,
    isUploading = false,
}: ImagesSectionProps) {
    const [isDragActive, setIsDragActive] = useState(false);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const processFiles = useCallback((files: FileList | null) => {
        if (!files) return;

        const validFiles = Array.from(files).filter(file => {
            const isImage = file.type.startsWith('image/');
            const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
            return isImage && isValidSize;
        });

        const remainingSlots = maxImages - images.length;
        const filesToAdd = validFiles.slice(0, remainingSlots);

        const newImages: ImageFile[] = filesToAdd.map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            isExisting: false,
        }));

        onImagesChange([...images, ...newImages]);
    }, [images, maxImages, onImagesChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        e.target.value = '';
    }, [processFiles]);

    const handleRemoveImage = useCallback((id: string) => {
        const imageToRemove = images.find(img => img.id === id);
        if (imageToRemove && !imageToRemove.isExisting) {
            URL.revokeObjectURL(imageToRemove.url);
        }
        onImagesChange(images.filter(img => img.id !== id));
    }, [images, onImagesChange]);

    const canAddMore = images.length < maxImages;

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-8 transition-all duration-200',
                    'hover:border-primary/50 hover:bg-muted/30',
                    isDragActive && 'border-primary bg-primary/5',
                    !canAddMore && 'opacity-50 pointer-events-none'
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={!canAddMore || isUploading}
                    aria-label="Upload images"
                />
                <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
                    {isUploading ? (
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    ) : (
                        <div className="p-3 rounded-full bg-muted">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}
                    <div className="text-center">
                        <p className="font-medium">
                            {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            or click to browse • Max {maxImages} images, 10MB each
                        </p>
                    </div>
                </div>
            </div>

            {images.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                            Uploaded Images ({images.length}/{maxImages})
                        </p>
                        {images.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    images.forEach(img => {
                                        if (!img.isExisting) URL.revokeObjectURL(img.url);
                                    });
                                    onImagesChange([]);
                                }}
                                className="text-destructive hover:text-destructive"
                            >
                                Remove All
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                className="relative group aspect-[4/3] rounded-lg overflow-hidden border bg-muted"
                            >
                                <Image
                                    src={image.url}
                                    alt={image.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                />
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                                        Main
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(image.id)}
                                    className={cn(
                                        'absolute top-2 right-2 p-1.5 rounded-full',
                                        'bg-black/60 text-white opacity-0 group-hover:opacity-100',
                                        'hover:bg-black/80 transition-all duration-200'
                                    )}
                                    aria-label={`Remove ${image.name}`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-xs text-white truncate">{image.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {images.length === 0 && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-dashed">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        No images uploaded yet. Add images to showcase your vehicle.
                    </p>
                </div>
            )}
        </div>
    );
}
