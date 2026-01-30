import Link from 'next/link';

export default function ForbiddenPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-destructive">403</h1>
                <h2 className="mt-4 text-2xl font-semibold">Access Denied</h2>
                <p className="mt-2 text-muted-foreground">
                    You don&apos;t have permission to access this page.
                </p>
                <div className="mt-6 flex gap-4 justify-center">
                    <Link
                        href="/"
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/login"
                        className="rounded-md border border-input bg-background px-4 py-2 hover:bg-accent"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
