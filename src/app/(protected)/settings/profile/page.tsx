import type { Metadata } from 'next';
import { ProfileSettingsContent } from './profile-settings-content';

export const metadata: Metadata = { title: 'Profile Settings' };

export default function ProfileSettingsPage() {
    return <ProfileSettingsContent />;
}
