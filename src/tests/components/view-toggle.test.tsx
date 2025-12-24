import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ViewToggle } from '@/components/cars/view-toggle';

describe('ViewToggle', () => {
    describe('rendering', () => {
        it('should render grid and list buttons', () => {
            const onChange = vi.fn();
            render(<ViewToggle value="grid" onChange={onChange} />);

            expect(screen.getByRole('button', { name: 'Grid view' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'List view' })).toBeInTheDocument();
        });

        it('should indicate grid as active when value is grid', () => {
            const onChange = vi.fn();
            render(<ViewToggle value="grid" onChange={onChange} />);

            const gridButton = screen.getByRole('button', { name: 'Grid view' });
            const listButton = screen.getByRole('button', { name: 'List view' });

            expect(gridButton).toHaveAttribute('aria-pressed', 'true');
            expect(listButton).toHaveAttribute('aria-pressed', 'false');
        });

        it('should indicate list as active when value is list', () => {
            const onChange = vi.fn();
            render(<ViewToggle value="list" onChange={onChange} />);

            const gridButton = screen.getByRole('button', { name: 'Grid view' });
            const listButton = screen.getByRole('button', { name: 'List view' });

            expect(gridButton).toHaveAttribute('aria-pressed', 'false');
            expect(listButton).toHaveAttribute('aria-pressed', 'true');
        });

        it('should apply custom className', () => {
            const onChange = vi.fn();
            const { container } = render(
                <ViewToggle value="grid" onChange={onChange} className="custom-class" />
            );

            expect(container.firstChild).toHaveClass('custom-class');
        });
    });

    describe('interactions', () => {
        it('should call onChange with "list" when list button is clicked', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();
            render(<ViewToggle value="grid" onChange={onChange} />);

            await user.click(screen.getByRole('button', { name: 'List view' }));

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith('list');
        });

        it('should call onChange with "grid" when grid button is clicked', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();
            render(<ViewToggle value="list" onChange={onChange} />);

            await user.click(screen.getByRole('button', { name: 'Grid view' }));

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith('grid');
        });

        it('should call onChange when clicking already active view', async () => {
            const user = userEvent.setup();
            const onChange = vi.fn();
            render(<ViewToggle value="grid" onChange={onChange} />);

            await user.click(screen.getByRole('button', { name: 'Grid view' }));

            expect(onChange).toHaveBeenCalledTimes(1);
            expect(onChange).toHaveBeenCalledWith('grid');
        });
    });

    describe('accessibility', () => {
        it('should have accessible labels for both buttons', () => {
            const onChange = vi.fn();
            render(<ViewToggle value="grid" onChange={onChange} />);

            expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
            expect(screen.getByLabelText('List view')).toBeInTheDocument();
        });

        it('should use aria-pressed for toggle state', () => {
            const onChange = vi.fn();
            render(<ViewToggle value="grid" onChange={onChange} />);

            const gridButton = screen.getByRole('button', { name: 'Grid view' });
            const listButton = screen.getByRole('button', { name: 'List view' });

            expect(gridButton).toHaveAttribute('aria-pressed');
            expect(listButton).toHaveAttribute('aria-pressed');
        });
    });
});
