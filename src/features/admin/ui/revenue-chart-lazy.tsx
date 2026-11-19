'use client';

import dynamic from 'next/dynamic';
import { RevenueChartSkeleton } from './revenue-chart-skeleton';

export const RevenueChart = dynamic(() => import('./revenue-chart').then((module) => module.RevenueChart), {
    ssr: false,
    loading: () => <RevenueChartSkeleton />,
});
