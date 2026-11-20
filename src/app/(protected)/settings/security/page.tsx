import type { Metadata } from 'next';
import { SecuritySettingsContent } from '@/widgets/security-settings';

export const metadata: Metadata = { title: 'Security Settings' };

export default function SecuritySettingsPage() {
    return <SecuritySettingsContent />;
}
