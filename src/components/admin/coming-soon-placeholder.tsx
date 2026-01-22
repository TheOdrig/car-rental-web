import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ComingSoonPlaceholderProps {
    title: string;
    description: string;
    className?: string;
}

export function ComingSoonPlaceholder({ title, description, className }: ComingSoonPlaceholderProps) {
    return (
        <Card className={cn('border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm', className)}>
            <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-4">
                        <Clock className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Coming Soon</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-500 max-w-sm">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
