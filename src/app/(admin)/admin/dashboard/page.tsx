import type { Metadata } from 'next';
import { AdminDashboardContent } from '@/widgets/admin-dashboard';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default function AdminDashboardPage() {
    return <AdminDashboardContent />;
}
