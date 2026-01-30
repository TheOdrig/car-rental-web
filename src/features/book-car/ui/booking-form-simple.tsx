'use client';

import React, { useState } from 'react';
import { Input } from '@/shared/ui';
import { Button } from '@/shared/ui';
import type { CreateBookingRequest } from '@/features/book-car';
import { createBooking } from '@/features/book-car';
import { validateDateRange } from '../lib/date-validation';
import { bookingActions } from '@/features/book-car';
import { publishBookingCreated } from '@/features/book-car';

interface BookingFormProps {
    carId: number;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function BookingForm({ carId, onSuccess, onError }: BookingFormProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const validationError = validateDateRange(start, end);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            const request: CreateBookingRequest = {
                carId,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                pickupLocation: 'Default Location',
                dropoffLocation: 'Default Location',
                addons: [],
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
            };

            const booking = await createBooking(request);
            bookingActions.setBooking(booking);
            publishBookingCreated(booking);

            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                    Start Date
                </label>
                <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                    End Date
                </label>
                <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">
                    Notes (Optional)
                </label>
                <Input
                    id="notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests?"
                />
            </div>

            {error && (
                <div className="text-red-600 text-sm">
                    {error}
                </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creating Booking...' : 'Book Now'}
            </Button>
        </form>
    );
}
