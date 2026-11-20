const UNSPLASH_HOST = 'images.unsplash.com';
const DEFAULT_QUALITY = 75;

export function isUnsplashUrl(src: string): boolean {
    try {
        return new URL(src).hostname === UNSPLASH_HOST;
    } catch {
        return false;
    }
}

export function unsplashImageUrl(src: string, width: number, quality: number = DEFAULT_QUALITY): string {
    const url = new URL(src);
    url.searchParams.set('w', String(Math.round(width)));
    url.searchParams.set('q', String(quality));
    url.searchParams.set('auto', 'format');
    if (!url.searchParams.has('fit')) url.searchParams.set('fit', 'crop');
    return url.toString();
}

export function unsplashLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
    return unsplashImageUrl(src, width, quality);
}
