import Link from 'next/link';

export default function CarNotFound() {
    return (
        <main className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">Car Not Found</h1>
            <p className="text-muted-foreground mb-8">
                The car you're looking for doesn't exist or has been removed.
            </p>
            <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
                Browse All Cars
            </Link>
        </main>
    );
}
