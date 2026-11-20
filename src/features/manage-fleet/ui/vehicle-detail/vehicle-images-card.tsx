'use client';

import { useState } from 'react';
import { DynamicImage } from '@/shared/ui/dynamic-image';
import { ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import type { VehicleImages } from '@/entities/car';

interface VehicleImagesCardProps {
    images: VehicleImages;
    vehicleName: string;
}

export function VehicleImagesCard({ images, vehicleName }: VehicleImagesCardProps) {
    const allImages = [images.primary, ...images.additional].filter(Boolean);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    };

    if (allImages.length === 0) {
        return (
            <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ImageIcon className="h-5 w-5 text-violet-500" />
                        Vehicle Images
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <ImageIcon className="h-12 w-12 text-slate-400 mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No images available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border bg-card">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ImageIcon className="h-5 w-5 text-violet-500" />
                        Vehicle Images
                    </CardTitle>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        {currentIndex + 1} / {allImages.length}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <DynamicImage
                            src={allImages[currentIndex]}
                            alt={`${vehicleName} - Image ${currentIndex + 1}`}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {allImages.length > 1 && (
                        <>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-card"
                                onClick={handlePrev}
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-card"
                                onClick={handleNext}
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </>
                    )}
                </div>

                {allImages.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative w-16 h-12 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${idx === currentIndex
                                    ? 'border-indigo-500'
                                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <DynamicImage
                                    src={img}
                                    alt={`Thumbnail ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}