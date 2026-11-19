import type { Metadata } from 'next';
import { LateReturnsContent } from './late-returns-content';

export const metadata: Metadata = { title: 'Late Returns' };

export default function LateReturnsPage() {
    return <LateReturnsContent />;
}
