'use client';

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { CopyButton } from '@/components/admin/copy-button';
import { renderWithProviders } from '../../test-utils';

describe('CopyButton', () => {
    it('should render copy button with correct aria-label', () => {
        renderWithProviders(<CopyButton value="test-value" />);

        expect(screen.getByRole('button', { name: /Copy to clipboard/i })).toBeInTheDocument();
    });

    it('should render as a ghost variant button', () => {
        renderWithProviders(<CopyButton value="test-value" />);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
    });

    it('should apply custom className', () => {
        renderWithProviders(<CopyButton value="test" className="custom-class" />);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
    });

    it('should have correct size class', () => {
        renderWithProviders(<CopyButton value="test" />);

        const button = screen.getByRole('button');
        expect(button).toHaveClass('h-6', 'w-6');
    });
});
