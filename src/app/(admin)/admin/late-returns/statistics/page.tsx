import type { Metadata } from 'next';
import { LateReturnStatisticsContent } from './late-return-statistics-content';

export const metadata: Metadata = { title: 'Late Return Statistics' };

export default function LateReturnStatisticsPage() {
    return <LateReturnStatisticsContent />;
}
