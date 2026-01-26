'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { showToast } from '@/lib/utils/toast';
import { ComingSoonBanner } from '@/components/ui/coming-soon-banner';

interface NotificationSetting {
    id: string;
    label: string;
    description: string;
    enabled: boolean;
}

interface NotificationCategory {
    id: string;
    title: string;
    icon: typeof Bell;
    settings: NotificationSetting[];
}

const INITIAL_SETTINGS: NotificationCategory[] = [
    {
        id: 'email',
        title: 'Email Notifications',
        icon: Mail,
        settings: [
            {
                id: 'email_bookings',
                label: 'Booking confirmations',
                description: 'Receive emails when bookings are confirmed or updated',
                enabled: true,
            },
            {
                id: 'email_reminders',
                label: 'Pick-up reminders',
                description: 'Get reminders before your rental starts',
                enabled: true,
            },
            {
                id: 'email_promotions',
                label: 'Promotions & offers',
                description: 'Receive special offers and discount codes',
                enabled: false,
            },
            {
                id: 'email_newsletter',
                label: 'Newsletter',
                description: 'Weekly tips and travel inspiration',
                enabled: false,
            },
        ],
    },
    {
        id: 'push',
        title: 'Push Notifications',
        icon: Smartphone,
        settings: [
            {
                id: 'push_bookings',
                label: 'Booking updates',
                description: 'Real-time updates on your bookings',
                enabled: true,
            },
            {
                id: 'push_reminders',
                label: 'Trip reminders',
                description: 'Reminders for pick-up and return times',
                enabled: true,
            },
            {
                id: 'push_messages',
                label: 'Messages',
                description: 'Notifications for new messages from support',
                enabled: true,
            },
        ],
    },
    {
        id: 'sms',
        title: 'SMS Notifications',
        icon: MessageSquare,
        settings: [
            {
                id: 'sms_confirmations',
                label: 'Booking confirmations',
                description: 'Receive SMS for booking confirmations',
                enabled: false,
            },
            {
                id: 'sms_reminders',
                label: 'Pick-up reminders',
                description: 'SMS reminders before your rental',
                enabled: false,
            },
        ],
    },
];

export default function NotificationsSettingsPage() {
    const [categories, setCategories] = useState(INITIAL_SETTINGS);

    const handleToggle = (categoryId: string, settingId: string, enabled: boolean) => {
        setCategories((prev) =>
            prev.map((category) =>
                category.id === categoryId
                    ? {
                        ...category,
                        settings: category.settings.map((setting) =>
                            setting.id === settingId ? { ...setting, enabled } : setting
                        ),
                    }
                    : category
            )
        );

        showToast.success(enabled ? 'Notification enabled' : 'Notification disabled');
    };

    return (
        <div className="space-y-6">
            <ComingSoonBanner
                title="Notification Preferences Coming Soon"
                description="Notification settings are currently stored locally and will not persist. Full notification management will be available in a future update."
            />
            {categories.map((category) => {
                const Icon = category.icon;

                return (
                    <Card key={category.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Icon className="h-5 w-5" />
                                {category.title}
                            </CardTitle>
                            <CardDescription>
                                Manage your {category.title.toLowerCase()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {category.settings.map((setting) => (
                                <div
                                    key={setting.id}
                                    className="flex items-center justify-between gap-4"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{setting.label}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {setting.description}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={setting.enabled}
                                        onCheckedChange={(enabled) =>
                                            handleToggle(category.id, setting.id, enabled)
                                        }
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

