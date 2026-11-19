import type { Metadata } from 'next';
import { AddCarContent } from './add-car-content';

export const metadata: Metadata = { title: 'Add Vehicle' };

export default function AddCarPage() {
    return <AddCarContent />;
}
