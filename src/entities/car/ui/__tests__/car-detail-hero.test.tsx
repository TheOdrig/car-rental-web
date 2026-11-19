import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/app/testing/test-utils';
import { createMockCar } from '../../lib/testing/factories';
import { CarDetail } from '../car-detail';

describe('CarDetail hero image', () => {
    it('asks the browser to fetch the hero with high priority', () => {
        renderWithProviders(<CarDetail car={createMockCar({ brand: 'Fiat', model: 'Egea', productionYear: 2022 })} />);

        expect(screen.getByAltText(/Fiat Egea 2022/)).toHaveAttribute('fetchpriority', 'high');
    });
});
