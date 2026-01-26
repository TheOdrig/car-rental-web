import { Skeleton } from '@/components/ui/skeleton';

export function CheckoutSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-6 w-36" />
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </section>

                <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex items-start p-4 rounded-xl border border-border"
                            >
                                <Skeleton className="h-5 w-5 rounded" />
                                <div className="ml-4 flex-1">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-5 w-48" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                    <Skeleton className="h-4 w-full mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                        <div className="p-6 pb-0">
                            <Skeleton className="h-6 w-40 mb-2" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                        </div>
                        <div className="px-6 py-8 flex justify-center">
                            <Skeleton className="w-full max-w-[280px] h-40" />
                        </div>
                        <div className="px-6 py-4 border-t border-border space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="w-2.5 h-2.5 rounded-full" />
                                    <div className="flex-1">
                                        <Skeleton className="h-3 w-16 mb-2" />
                                        <Skeleton className="h-4 w-full mb-1" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-muted/50 px-6 py-6 border-t border-border">
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                ))}
                            </div>
                            <Skeleton className="h-px w-full my-4" />
                            <div className="flex justify-between items-end mb-6">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-8 w-28" />
                            </div>
                            <Skeleton className="h-14 w-full rounded-xl" />
                            <div className="mt-4 flex justify-center">
                                <Skeleton className="h-4 w-40" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl shadow-sm border border-border p-5 flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

