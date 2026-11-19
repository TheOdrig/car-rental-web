import type { Metadata } from 'next';
import { DamagesContent } from './damages-content';

export const metadata: Metadata = { title: 'Admin Damage Reports' };

export default function DamagesPage() {
    return <DamagesContent />;
}
