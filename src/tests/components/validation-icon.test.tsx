import { describe, it, expect } from 'vitest';
import { render} from '@testing-library/react';
import { ValidationIcon } from '@/components/shared/validation-icon';

describe('ValidationIcon', () => {
    describe('Valid State', () => {
        it('should render checkmark icon for valid state', () => {
            render(<ValidationIcon state="valid" />);
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('text-green-600');
        });

        it('should have aria-hidden attribute', () => {
            render(<ValidationIcon state="valid" />);
            const icon = document.querySelector('svg');
            expect(icon).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('Invalid State', () => {
        it('should render X icon for invalid state', () => {
            render(<ValidationIcon state="invalid" />);
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('text-destructive');
        });
    });

    describe('Empty State', () => {
        it('should render alert icon for empty state', () => {
            render(<ValidationIcon state="empty" />);
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('text-destructive');
        });
    });

    describe('Loading State', () => {
        it('should render spinner icon for loading state', () => {
            render(<ValidationIcon state="loading" />);
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('animate-spin');
            expect(icon).toHaveClass('text-primary');
        });
    });

    describe('Idle State', () => {
        it('should render nothing for idle state', () => {
            const { container } = render(<ValidationIcon state="idle" />);
            expect(container.querySelector('svg')).not.toBeInTheDocument();
        });
    });

    describe('Focused State', () => {
        it('should render nothing for focused state', () => {
            const { container } = render(<ValidationIcon state="focused" />);
            expect(container.querySelector('svg')).not.toBeInTheDocument();
        });
    });

    describe('Disabled State', () => {
        it('should render nothing for disabled state', () => {
            const { container } = render(<ValidationIcon state="disabled" />);
            expect(container.querySelector('svg')).not.toBeInTheDocument();
        });
    });

    describe('Size Variants', () => {
        it('should apply small size classes', () => {
            render(<ValidationIcon state="valid" size="sm" />);
            const icon = document.querySelector('svg');
            expect(icon).toHaveClass('h-4', 'w-4');
        });

        it('should apply medium size classes by default', () => {
            render(<ValidationIcon state="valid" />);
            const icon = document.querySelector('svg');
            expect(icon).toHaveClass('h-5', 'w-5');
        });

        it('should apply large size classes', () => {
            render(<ValidationIcon state="valid" size="lg" />);
            const icon = document.querySelector('svg');
            expect(icon).toHaveClass('h-6', 'w-6');
        });
    });

    describe('Custom ClassName', () => {
        it('should apply custom className', () => {
            render(<ValidationIcon state="valid" className="custom-class" />);
            const icon = document.querySelector('svg');
            expect(icon).toHaveClass('custom-class');
        });
    });
});
