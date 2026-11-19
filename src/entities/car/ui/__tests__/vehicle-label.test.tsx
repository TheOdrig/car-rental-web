import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse, server, installMockApi } from '@/app/testing/msw';
import { VehicleLabel } from '../vehicle-label';

installMockApi();

const summary = { id: 7, brand: 'Toyota', model: 'Corolla', licensePlate: '35 ABC 123' };

describe('VehicleLabel', () => {
    it('shows make, model and plate straight from the summary', () => {
        render(<VehicleLabel carSummary={summary} licensePlate="35 ABC 123" />);

        expect(screen.getByText('Toyota Corolla (35 ABC 123)')).toBeInTheDocument();
    });

    it('stacks the plate under the name when asked to', () => {
        render(<VehicleLabel carSummary={{ ...summary, brand: 'Audi', model: 'A3' }} licensePlate="35 ABC 123" stacked />);

        expect(screen.getByText('Audi A3')).toBeInTheDocument();
        expect(screen.getByText('35 ABC 123')).toBeInTheDocument();
    });

    it('falls back to the plate when there is no summary', () => {
        render(<VehicleLabel licensePlate="35 ABC 123" />);

        expect(screen.getByText('35 ABC 123')).toBeInTheDocument();
    });

    it('never asks the API for the car', async () => {
        let carRequests = 0;
        server.use(
            http.get('/api/cars/7', () => {
                carRequests += 1;
                return HttpResponse.json({ car: summary });
            })
        );

        render(<VehicleLabel carSummary={summary} licensePlate="35 ABC 123" />);
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(carRequests).toBe(0);
    });
});
