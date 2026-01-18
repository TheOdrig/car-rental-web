import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';

describe('FormField', () => {
    describe('Label Rendering', () => {
        it('should render label with htmlFor attribute', () => {
            render(
                <FormField label="Email" htmlFor="email">
                    <Input id="email" />
                </FormField>
            );
            const label = screen.getByText('Email');
            expect(label).toBeInTheDocument();
            expect(label).toHaveAttribute('for', 'email');
        });

        it('should render required indicator when required is true', () => {
            render(
                <FormField label="Email" htmlFor="email" required>
                    <Input id="email" />
                </FormField>
            );
            expect(screen.getByText('*')).toBeInTheDocument();
        });

        it('should not render required indicator when required is false', () => {
            render(
                <FormField label="Email" htmlFor="email">
                    <Input id="email" />
                </FormField>
            );
            expect(screen.queryByText('*')).not.toBeInTheDocument();
        });
    });

    describe('Description Rendering', () => {
        it('should render description when provided', () => {
            render(
                <FormField label="Email" htmlFor="email" description="Enter your email address">
                    <Input id="email" />
                </FormField>
            );
            expect(screen.getByText('Enter your email address')).toBeInTheDocument();
        });

        it('should render ReactNode description', () => {
            render(
                <FormField
                    label="Email"
                    htmlFor="email"
                    description={<a href="/help">Need help?</a>}
                >
                    <Input id="email" />
                </FormField>
            );
            expect(screen.getByRole('link', { name: 'Need help?' })).toBeInTheDocument();
        });
    });

    describe('Error Message Display', () => {
        it('should render error message when error is provided', () => {
            render(
                <FormField label="Email" htmlFor="email" error="Email is required">
                    <Input id="email" />
                </FormField>
            );
            expect(screen.getByText('Email is required')).toBeInTheDocument();
        });

        it('should have role="alert" on error message', () => {
            render(
                <FormField label="Email" htmlFor="email" error="Email is required">
                    <Input id="email" />
                </FormField>
            );
            expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
        });

        it('should apply destructive text color to error', () => {
            render(
                <FormField label="Email" htmlFor="email" error="Error" validationState="invalid">
                    <Input id="email" />
                </FormField>
            );
            const errorElement = screen.getByText('Error');
            expect(errorElement).toHaveClass('text-destructive');
        });
    });

    describe('Success Message Display', () => {
        it('should render success message when success is provided', () => {
            render(
                <FormField label="Email" htmlFor="email" success="Email is valid">
                    <Input id="email" />
                </FormField>
            );
            expect(screen.getByText('Email is valid')).toBeInTheDocument();
        });

        it('should not have role="alert" on success message', () => {
            render(
                <FormField label="Email" htmlFor="email" success="Email is valid">
                    <Input id="email" />
                </FormField>
            );
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('Validation Icon', () => {
        it('should show validation icon for valid state', () => {
            render(
                <FormField label="Email" htmlFor="email" validationState="valid">
                    <Input id="email" />
                </FormField>
            );
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should show validation icon for invalid state', () => {
            render(
                <FormField label="Email" htmlFor="email" validationState="invalid">
                    <Input id="email" />
                </FormField>
            );
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should not show icon when showIcon is false', () => {
            render(
                <FormField label="Email" htmlFor="email" validationState="valid" showIcon={false}>
                    <Input id="email" />
                </FormField>
            );
            expect(document.querySelector('svg')).not.toBeInTheDocument();
        });

        it('should not show icon for idle state', () => {
            render(
                <FormField label="Email" htmlFor="email" validationState="idle">
                    <Input id="email" />
                </FormField>
            );
            expect(document.querySelector('svg')).not.toBeInTheDocument();
        });
    });

    describe('Disabled State', () => {
        it('should apply muted styles to label when disabled', () => {
            render(
                <FormField label="Email" htmlFor="email" isDisabled>
                    <Input id="email" disabled />
                </FormField>
            );
            const label = screen.getByText('Email');
            expect(label).toHaveClass('text-slate-600');
            expect(label).toHaveClass('cursor-not-allowed');
        });
    });

    describe('Loading State', () => {
        it('should show spinner icon when loading', () => {
            render(
                <FormField label="Email" htmlFor="email" isLoading>
                    <Input id="email" />
                </FormField>
            );
            const icon = document.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('animate-spin');
        });
    });

    describe('Children Rendering', () => {
        it('should render children (input element)', () => {
            render(
                <FormField label="Email" htmlFor="email">
                    <Input id="email" placeholder="Enter email" />
                </FormField>
            );
            expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
        });
    });

    describe('Custom ClassName', () => {
        it('should apply custom className to wrapper', () => {
            const { container } = render(
                <FormField label="Email" htmlFor="email" className="custom-wrapper">
                    <Input id="email" />
                </FormField>
            );
            expect(container.firstChild).toHaveClass('custom-wrapper');
        });
    });
});
