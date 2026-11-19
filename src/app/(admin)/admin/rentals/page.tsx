import type { Metadata } from 'next';
import { AdminRentalsContent } from './admin-rentals-content';

export const metadata: Metadata = { title: 'Rental Management' };

export default function AdminRentalsPage() {
    return <AdminRentalsContent />;
}
