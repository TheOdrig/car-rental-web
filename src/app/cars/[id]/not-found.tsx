import Link from 'next/link';
import { ROUTES } from '@/shared/config/routes';

export default function CarNotFound() {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">Car Not Found</h1>
            <p className="text-muted-foreground mb-8">
                The car you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
                href={ROUTES.home}
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
                Browse All Cars
            </Link>
        </div>
    );
}