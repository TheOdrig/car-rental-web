import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertsPanel } from '@/components/admin/alerts-panel';
import { renderWithProviders } from '../../test-utils';
import { AdminAlert } from '@/types/admin';

vi.mock('@/lib/utils/format', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/lib/utils/format')>();
    return {
        ...original,
        safeFormatDistanceToNow: vi.fn(() => '2 minutes ago'),
    };
});

describe('AlertsPanel', () => {
    const user = userEvent.setup();

    const mockAlerts: AdminAlert[] = [
        {
            id: '1',
            type: 'critical',
            title: 'Critical Engine Error',
            description: 'Engine failure detected in Toyota Camry ABC-1234',
            timestamp: new Date().toISOString(),
            actions: [
                { label: 'View Vehicle', action: 'view_vehicle', variant: 'default' }
            ],
            dismissible: true
        },
        {
            id: '2',
            type: 'warning',
            title: 'Maintenance Due',
            description: 'Vehicle XYZ-5678 is approaching maintenance limit.',
            timestamp: new Date().toISOString(),
            dismissible: true
        },
        {
            id: '3',
            type: 'info',
            title: 'System Update',
            description: 'New fleet management features are now available.',
            timestamp: new Date().toISOString(),
            dismissible: false
        }
    ];

    it('should render nothing if alerts list is empty', () => {
        const { container } = renderWithProviders(<AlertsPanel alerts={[]} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('should render the list of alerts with correct titles and descriptions', () => {
        renderWithProviders(<AlertsPanel alerts={mockAlerts} />);

        expect(screen.getByText('Critical Engine Error')).toBeInTheDocument();
        expect(screen.getByText('Maintenance Due')).toBeInTheDocument();
        expect(screen.getByText('System Update')).toBeInTheDocument();

        expect(screen.getByText(/Engine failure detected/)).toBeInTheDocument();
    });

    it('should show the number of alerts in the title', () => {
        renderWithProviders(<AlertsPanel alerts={mockAlerts} />);
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render action buttons when provided', () => {
        renderWithProviders(<AlertsPanel alerts={mockAlerts} />);
        expect(screen.getByRole('button', { name: /View Vehicle/i })).toBeInTheDocument();
    });

    it('should call onAction when an action button is clicked', async () => {
        const onAction = vi.fn();
        renderWithProviders(<AlertsPanel alerts={mockAlerts} onAction={onAction} />);

        const actionButton = screen.getByRole('button', { name: /View Vehicle/i });
        await user.click(actionButton);

        expect(onAction).toHaveBeenCalledWith('1', 'view_vehicle');
    });

    it('should call onDismiss when the close button is clicked', async () => {
        const onDismiss = vi.fn();
        renderWithProviders(<AlertsPanel alerts={mockAlerts} onDismiss={onDismiss} />);

        const dismissButtons = screen.getAllByRole('button', { name: /Dismiss/i });
        await user.click(dismissButtons[0]);

        expect(onDismiss).toHaveBeenCalledWith('1');
    });

    it('should not render dismiss button for non-dismissible alerts', () => {
        renderWithProviders(<AlertsPanel alerts={mockAlerts} />);

        const dismissButtons = screen.getAllByRole('button', { name: /Dismiss/i });
        expect(dismissButtons).toHaveLength(2);
    });

    it('should display relative time', () => {
        renderWithProviders(<AlertsPanel alerts={mockAlerts} />);
        const times = screen.getAllByText('2 minutes ago');
        expect(times).toHaveLength(3);
    });
});
