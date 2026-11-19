import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BasicInfoSection } from '../basic-info';
import { PricingSection } from '../pricing';
import { focusFirstInvalidField } from '../../../lib/use-car-form';
import { defaultCarFormData } from '../../../model/types';

describe('car form field errors', () => {
    it('marks an invalid input and links it to its message', () => {
        render(
            <BasicInfoSection
                data={defaultCarFormData}
                errors={{ model: 'Model is required', licensePlate: 'License plate is required' }}
                onUpdate={vi.fn()}
            />
        );

        const model = screen.getByLabelText(/Model/);
        expect(model).toHaveAttribute('aria-invalid', 'true');
        expect(model).toHaveAttribute('aria-describedby', 'model-error');
        expect(document.getElementById('model-error')).toHaveTextContent('Model is required');
        expect(screen.getByLabelText(/License Plate/)).toHaveAttribute('aria-describedby', 'licensePlate-error');
        expect(screen.getByLabelText(/VIN/)).not.toHaveAttribute('aria-invalid');
    });

    it('marks the daily rate', () => {
        render(<PricingSection data={defaultCarFormData} errors={{ dailyRate: 'Daily rate must be greater than 0' }} onUpdate={vi.fn()} />);

        expect(screen.getByLabelText(/Daily Rate/)).toHaveAttribute('aria-invalid', 'true');
    });

    it('moves focus to the first invalid field in form order', () => {
        render(
            <BasicInfoSection data={defaultCarFormData} errors={{ licensePlate: 'x', vin: 'y' }} onUpdate={vi.fn()} />
        );

        focusFirstInvalidField({ vin: 'y', licensePlate: 'x' });

        expect(screen.getByLabelText(/License Plate/)).toHaveFocus();
    });
});
