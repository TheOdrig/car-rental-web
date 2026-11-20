import type { Metadata } from 'next';
import { FleetManagementContent } from '@/widgets/admin-fleet';

export const metadata: Metadata = { title: 'Fleet Management' };

export default function FleetManagementPage() {
    return <FleetManagementContent />;
}
