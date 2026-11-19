import type { Metadata } from 'next';
import { MyDamagesContent } from './my-damages-content';

export const metadata: Metadata = { title: 'My Damages' };

export default function MyDamagesPage() {
    return <MyDamagesContent />;
}
