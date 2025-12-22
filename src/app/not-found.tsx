import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">404</h1>
            <h2 className="mt-2 text-xl font-semibold">Page Not Found</h2>
            <p className="mt-4 text-muted-foreground max-w-md">
                Sorry, we couldn&apos;t find the page you&apos;re looking for.
                It might have been moved or doesn&apos;t exist.
            </p>
            <div className="mt-8 flex gap-4">
                <Button asChild variant="outline">
                    <Link href="/">Go Home</Link>
                </Button>
                <Button asChild>
                    <Link href="/cars">Browse Cars</Link>
                </Button>
            </div>
        </div>
    );
}
