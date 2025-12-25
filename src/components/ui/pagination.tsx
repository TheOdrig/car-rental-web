'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    siblingCount?: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
    siblingCount = 1,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages = generatePagination(currentPage, totalPages, siblingCount);

    return (
        <nav
            aria-label="Pagination"
            className={cn('flex items-center justify-center gap-1', className)}
        >
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {pages.map((page, index) => {
                if (page === 'ellipsis') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="flex items-center justify-center w-10 h-10"
                            aria-hidden="true"
                        >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </span>
                    );
                }

                const pageNumber = page as number;
                const isActive = pageNumber === currentPage;

                return (
                    <Button
                        key={pageNumber}
                        variant={isActive ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => onPageChange(pageNumber)}
                        aria-label={`Page ${pageNumber + 1}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {pageNumber + 1}
                    </Button>
                );
            })}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </nav>
    );
}

function generatePagination(
    currentPage: number,
    totalPages: number,
    siblingCount: number
): (number | 'ellipsis')[] {
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPages <= totalPageNumbers) {
        return Array.from({ length: totalPages }, (_, i) => i);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 0);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1);

    const showLeftEllipsis = leftSiblingIndex > 1;
    const showRightEllipsis = rightSiblingIndex < totalPages - 2;

    if (!showLeftEllipsis && showRightEllipsis) {
        const leftItemCount = 3 + 2 * siblingCount;
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i);
        return [...leftRange, 'ellipsis', totalPages - 1];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
        const rightItemCount = 3 + 2 * siblingCount;
        const rightRange = Array.from(
            { length: rightItemCount },
            (_, i) => totalPages - rightItemCount + i
        );
        return [0, 'ellipsis', ...rightRange];
    }

    const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
    );
    return [0, 'ellipsis', ...middleRange, 'ellipsis', totalPages - 1];
}

interface PaginationInfoProps {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    className?: string;
}

export function PaginationInfo({
    currentPage,
    pageSize,
    totalElements,
    className,
}: PaginationInfoProps) {
    const start = currentPage * pageSize + 1;
    const end = Math.min((currentPage + 1) * pageSize, totalElements);

    return (
        <p className={cn('text-sm text-muted-foreground', className)}>
            Showing <span className="font-medium text-foreground">{start}</span> to{' '}
            <span className="font-medium text-foreground">{end}</span> of{' '}
            <span className="font-medium text-foreground">{totalElements}</span> results
        </p>
    );
}
