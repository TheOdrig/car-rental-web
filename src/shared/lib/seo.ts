import type { Metadata } from 'next';

interface PageMetadataInput {
    title: string;
    description: string;
    path: string;
    absoluteTitle?: boolean;
    image?: string;
}

export function pageMetadata({ title, description, path, absoluteTitle = false, image }: PageMetadataInput): Metadata {
    return {
        title: absoluteTitle ? { absolute: title } : title,
        description,
        alternates: { canonical: path },
        openGraph: {
            type: 'website',
            siteName: 'Car Rental',
            title,
            description,
            url: path,
            ...(image ? { images: [{ url: image }] } : {}),
        },
        twitter: {
            card: image ? 'summary_large_image' : 'summary',
            title,
            description,
            ...(image ? { images: [image] } : {}),
        },
    };
}
