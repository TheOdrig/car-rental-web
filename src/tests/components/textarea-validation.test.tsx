import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea Component - Validation States', () => {
    describe('Idle State', () => {
        it('should render with idle state by default', () => {
            render(<Textarea placeholder="Enter text" />);
            const textarea = screen.getByPlaceholderText('Enter text');
            expect(textarea).toHaveAttribute('data-validation-state', 'idle');
        });

        it('should have default border classes', () => {
            render(<Textarea placeholder="Enter text" />);
            const textarea = screen.getByPlaceholderText('Enter text');
            expect(textarea).toHaveClass('border-input');
        });
    });

    describe('Valid State', () => {
        it('should apply valid state styling', () => {
            render(<Textarea placeholder="Enter text" validationState="valid" />);
            const textarea = screen.getByPlaceholderText('Enter text');
            expect(textarea).toHaveAttribute('data-validation-state', 'valid');
            expect(textarea).toHaveClass('border-green-500');
        });
    });

    describe('Invalid State', () => {
        it('should apply invalid state styling', () => {
            render(<Textarea placeholder="Enter text" validationState="invalid" />);
            const textarea = screen.getByPlaceholderText('Enter text');
            expect(textarea).toHaveAttribute('data-validation-state', 'invalid');
            expect(textarea).toHaveClass('border-destructive');
        });

        it('should have aria-invalid for invalid state', () => {
            render(<Textarea placeholder="Enter text" validationState="invalid" />);
            const textarea = screen.getByPlaceholderText('Enter text');
            expect(textarea).toHaveAttribute('aria-invalid', 'true');
        });
    });

    describe('Loading State', () => {
        it('should apply loading state styling', () => {
            render(<Textarea placeholder="Enter text" isLoading />);
            const textarea = screen.getByPlaceholderText('Enter text');
            expect(textarea).toHaveAttribute('data-validation-state', 'loading');
            expect(textarea).toHaveAttribute('aria-busy', 'true');
        });
    });

    describe('Disabled State', () => {
        it('should apply disabled state styling', () => {
            render(<Textarea placeholder="Enter text" disabled />);
            const textarea = screen.getByPlaceholderText('Enter text');
            expect(textarea).toHaveAttribute('data-validation-state', 'disabled');
            expect(textarea).toBeDisabled();
        });
    });

    describe('Accessibility', () => {
        it('should have data-slot attribute', () => {
            render(<Textarea placeholder="Enter text" />);
            const textarea = screen.getByPlaceholderText('Enter text');
            expect(textarea).toHaveAttribute('data-slot', 'textarea');
        });
    });
});

