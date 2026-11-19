import type { Metadata } from 'next';
import { DamageStatisticsContent } from './damage-statistics-content';

export const metadata: Metadata = { title: 'Admin Damage Statistics' };

export default function DamageStatisticsPage() {
    return <DamageStatisticsContent />;
}
