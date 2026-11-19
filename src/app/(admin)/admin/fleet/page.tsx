import type { Metadata } from 'next';
import { FleetManagementContent } from './fleet-management-content';

export const metadata: Metadata = { title: 'Fleet Management' };

export default function FleetManagementPage() {
    return <FleetManagementContent />;
}
