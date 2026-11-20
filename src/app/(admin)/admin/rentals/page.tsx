import type { Metadata } from 'next';
import { AdminRentalsContent } from '@/widgets/admin-rentals';

export const metadata: Metadata = { title: 'Rental Management' };

export default function AdminRentalsPage() {
    return <AdminRentalsContent />;
}
