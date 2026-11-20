import type { Metadata } from 'next';
import { DamagesContent } from '@/widgets/admin-damages';

export const metadata: Metadata = { title: 'Admin Damage Reports' };

export default function DamagesPage() {
    return <DamagesContent />;
}
