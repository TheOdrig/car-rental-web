import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/app/testing/test-utils';
import { http, HttpResponse, server, installMockApi } from '@/app/testing/msw';
import { VehicleLabel } from '../vehicle-label';

installMockApi();

function renderLabel(stacked = false) {
    return render(
        <QueryClientProvider client={createTestQueryClient()}>
            <VehicleLabel carId={7} licensePlate="35 ABC 123" stacked={stacked} />
        </QueryClientProvider>
    );
}

describe('VehicleLabel', () => {
    it('shows the plate first and adds make and model once the car loads', async () => {
        server.use(
            http.get('/api/cars/7', () => HttpResponse.json({ car: { id: 7, brand: 'Toyota', model: 'Corolla' } }))
        );

        renderLabel();

        expect(screen.getByText('35 ABC 123')).toBeInTheDocument();
        expect(await screen.findByText('Toyota Corolla (35 ABC 123)')).toBeInTheDocument();
    });

    it('stacks the plate under the name when asked to', async () => {
        server.use(
            http.get('/api/cars/7', () => HttpResponse.json({ car: { id: 7, brand: 'Audi', model: 'A3' } }))
        );

        renderLabel(true);

        expect(await screen.findByText('Audi A3')).toBeInTheDocument();
        expect(screen.getByText('35 ABC 123')).toBeInTheDocument();
    });

    it('keeps showing the plate when the car cannot be loaded', async () => {
        server.use(
            http.get('/api/cars/7', () => HttpResponse.json({ detail: 'gone' }, { status: 404 }))
        );

        renderLabel();

        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(screen.getByText('35 ABC 123')).toBeInTheDocument();
    });
});
