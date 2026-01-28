'use client';

import React from 'react';
import { Card } from '@/shared/ui';
import type { Rental } from '@/types/rental';

interface RentalListProps {
    rentals: Rental[];
    onRentalClick?: (rental: Rental) => void;
}

export function RentalList({ rentals, onRentalClick }: RentalListProps) {
    if (rentals.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No rentals found
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {rentals.map((rental) => (
                <Card
                    key={rental.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => onRentalClick?.(rental)}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg">
                                {rental.carSummary.brand} {rental.carSummary.model}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {rental.userSummary.username} ({rental.userSummary.email})
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rental.status)}`}>
                                {rental.status}
                            </div>
                            <p className="mt-2 font-semibold">
                                {rental.totalPrice} {rental.currency}
                            </p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        'Requested': 'bg-yellow-100 text-yellow-800',
        'Confirmed': 'bg-blue-100 text-blue-800',
        'In Use': 'bg-green-100 text-green-800',
        'Returned': 'bg-gray-100 text-gray-800',
        'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}
