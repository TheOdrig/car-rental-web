import type { Metadata } from 'next';
import { UserManagementContent } from './user-management-content';

export const metadata: Metadata = { title: 'Customers' };

export default function UserManagementPage() {
    return <UserManagementContent />;
}
