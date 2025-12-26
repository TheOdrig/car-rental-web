import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input Component - Validation States', () => {
    describe('Idle State', () => {
        it('should render with idle state by default', () => {
            render(<Input placeholder="Enter text" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'idle');
        });

        it('should have default border classes', () => {
            render(<Input placeholder="Enter text" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveClass('border-input');
        });
    });

    describe('Valid State', () => {
        it('should apply valid state styling', () => {
            render(<Input placeholder="Enter text" validationState="valid" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'valid');
            expect(input).toHaveClass('border-green-500');
        });

        it('should not have aria-invalid for valid state', () => {
            render(<Input placeholder="Enter text" validationState="valid" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).not.toHaveAttribute('aria-invalid');
        });
    });

    describe('Invalid State', () => {
        it('should apply invalid state styling', () => {
            render(<Input placeholder="Enter text" validationState="invalid" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'invalid');
            expect(input).toHaveClass('border-destructive');
        });

        it('should have aria-invalid for invalid state', () => {
            render(<Input placeholder="Enter text" validationState="invalid" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('aria-invalid', 'true');
        });
    });

    describe('Empty State', () => {
        it('should apply empty state styling', () => {
            render(<Input placeholder="Enter text" validationState="empty" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'empty');
            expect(input).toHaveClass('border-destructive');
        });

        it('should have aria-invalid for empty state', () => {
            render(<Input placeholder="Enter text" validationState="empty" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('aria-invalid', 'true');
        });
    });

    describe('Loading State', () => {
        it('should apply loading state styling', () => {
            render(<Input placeholder="Enter text" validationState="loading" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'loading');
            expect(input).toHaveClass('border-ring');
        });

        it('should have aria-busy for loading state', () => {
            render(<Input placeholder="Enter text" isLoading />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('aria-busy', 'true');
        });
    });

    describe('Disabled State', () => {
        it('should apply disabled state styling', () => {
            render(<Input placeholder="Enter text" disabled />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'disabled');
            expect(input).toBeDisabled();
        });

        it('should have muted background when disabled', () => {
            render(<Input placeholder="Enter text" disabled />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveClass('bg-muted');
        });
    });

    describe('Error Prop', () => {
        it('should set invalid state when error is provided', () => {
            render(<Input placeholder="Enter text" error="This field is required" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'invalid');
        });
    });

    describe('Success Prop', () => {
        it('should set valid state when success is provided', () => {
            render(<Input placeholder="Enter text" success="Looks good!" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'valid');
        });
    });

    describe('State Priority', () => {
        it('should prioritize disabled over other states', () => {
            render(<Input placeholder="Enter text" disabled error="Error" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'disabled');
        });

        it('should prioritize loading over error', () => {
            render(<Input placeholder="Enter text" isLoading error="Error" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'loading');
        });

        it('should prioritize error over success', () => {
            render(<Input placeholder="Enter text" error="Error" success="Success" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-validation-state', 'invalid');
        });
    });

    describe('Custom ClassName', () => {
        it('should merge custom className with validation classes', () => {
            render(<Input placeholder="Enter text" className="custom-class" validationState="valid" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveClass('custom-class');
            expect(input).toHaveClass('border-green-500');
        });
    });

    describe('Accessibility', () => {
        it('should have data-slot attribute', () => {
            render(<Input placeholder="Enter text" />);
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('data-slot', 'input');
        });

        it('should pass through standard input attributes', () => {
            render(
                <Input
                    placeholder="Enter text"
                    type="email"
                    name="email"
                    id="email-input"
                    required
                />
            );
            const input = screen.getByPlaceholderText('Enter text');
            expect(input).toHaveAttribute('type', 'email');
            expect(input).toHaveAttribute('name', 'email');
            expect(input).toHaveAttribute('id', 'email-input');
            expect(input).toBeRequired();
        });
    });
});
