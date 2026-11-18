'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface UserTablePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function UserTablePagination({ currentPage, totalPages, onPageChange }: UserTablePaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 0}>
                    <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                    Previous
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
            </div>
        </div>
    );
}
