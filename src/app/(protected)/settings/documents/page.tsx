'use client';

import { useState, useRef, useCallback, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, FileText, CheckCircle, Clock, XCircle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/utils/toast';
import { ComingSoonBanner } from '@/components/ui/coming-soon-banner';

type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

interface DocumentUpload {
    id: string;
    name: string;
    url?: string;
    status: VerificationStatus;
    uploadedAt?: string;
}

const STATUS_CONFIG = {
    none: {
        label: 'Not Uploaded',
        icon: FileText,
        className: 'text-muted-foreground',
    },
    pending: {
        label: 'Pending Review',
        icon: Clock,
        className: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    verified: {
        label: 'Verified',
        icon: CheckCircle,
        className: 'text-green-600 bg-green-50 border-green-200',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        className: 'text-red-600 bg-red-50 border-red-200',
    },
};

export default function DocumentsSettingsPage() {
    const [license, setLicense] = useState<DocumentUpload | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            showToast.error('Please upload an image or PDF file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showToast.error('File must be less than 10MB');
            return;
        }

        setIsUploading(true);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const reader = new FileReader();
        reader.onloadend = () => {
            setLicense({
                id: '1',
                name: file.name,
                url: reader.result as string,
                status: 'pending',
                uploadedAt: new Date().toISOString(),
            });
            setIsUploading(false);
            showToast.success('Document uploaded successfully');
        };
        reader.readAsDataURL(file);
    }, []);

    const handleRemove = useCallback(() => {
        setLicense(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        showToast.success('Document removed');
    }, []);

    const status = license?.status || 'none';
    const StatusIcon = STATUS_CONFIG[status].icon;

    return (
        <div className="space-y-6">
            <ComingSoonBanner
                title="Document Verification Coming Soon"
                description="Document upload and verification features are currently under development. Uploaded documents will not be processed until this feature is fully implemented."
            />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Driver&apos;s License
                    </CardTitle>
                    <CardDescription>
                        Upload a valid driver&apos;s license for identity verification
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {!license ? (
                        <button
                            type="button"
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary hover:bg-muted/50"
                        >
                            {isUploading ? (
                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            ) : (
                                <Upload className="h-10 w-10 text-muted-foreground" />
                            )}
                            <div className="text-center">
                                <p className="font-medium">
                                    {isUploading ? 'Uploading...' : 'Click to upload'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    PNG, JPG, or PDF up to 10MB
                                </p>
                            </div>
                        </button>
                    ) : (
                        <div className="flex items-start gap-4 rounded-lg border p-4">
                            {license.url && license.url.startsWith('data:image') ? (
                                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
                                    <Image
                                        src={license.url}
                                        alt="License preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}

                            <div className="flex-1">
                                <p className="font-medium">{license.name}</p>
                                <Badge
                                    variant="outline"
                                    className={cn('mt-2 gap-1', STATUS_CONFIG[status].className)}
                                >
                                    <StatusIcon className="h-3 w-3" />
                                    {STATUS_CONFIG[status].label}
                                </Badge>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemove}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Verification Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Document must be clearly readable</li>
                        <li>• All corners must be visible</li>
                        <li>• Document must not be expired</li>
                        <li>• Name must match your profile information</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}

