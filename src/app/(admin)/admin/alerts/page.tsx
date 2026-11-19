import type { Metadata } from 'next';
import { AdminAlertsContent } from './admin-alerts-content';

export const metadata: Metadata = { title: 'Admin Alerts' };

export default function AdminAlertsPage() {
    return <AdminAlertsContent />;
}
