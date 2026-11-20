'use client';

import { Breadcrumb } from '@/shared/ui/breadcrumb';
import { ROUTES } from '@/shared/config/routes';
import { DetailPageSkeleton } from './detail-page-skeleton';
import { DetailPageError } from './detail-page-error';

export interface DetailSection {
    label: string;
    href: string;
    backLabel: string;
}

function DetailBreadcrumb({ section, current }: { section: DetailSection; current: string }) {
    return (
        <Breadcrumb
            items={[
                { label: 'Dashboard', href: ROUTES.admin.dashboard },
                { label: section.label, href: section.href },
                { label: current },
            ]}
        />
    );
}

export function DetailPageLoadingState({ section }: { section: DetailSection }) {
    return (
        <div className="space-y-6 p-6">
            <DetailBreadcrumb section={section} current="Loading..." />
            <DetailPageSkeleton />
        </div>
    );
}

interface DetailPageErrorStateProps {
    section: DetailSection;
    current: string;
    title: string;
    message: string;
    onRetry: () => void;
}

export function DetailPageErrorState({ section, current, title, message, onRetry }: DetailPageErrorStateProps) {
    return (
        <div className="space-y-6 p-6">
            <DetailBreadcrumb section={section} current={current} />
            <DetailPageError
                title={title}
                message={message}
                onRetry={onRetry}
                backUrl={section.href}
                backLabel={section.backLabel}
            />
        </div>
    );
}
