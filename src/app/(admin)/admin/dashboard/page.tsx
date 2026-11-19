import type { Metadata } from 'next';
import { AdminDashboardContent } from './admin-dashboard-content';

export const metadata: Metadata = { title: 'Admin Dashboard' };

export default function AdminDashboardPage() {
    return <AdminDashboardContent />;
}
