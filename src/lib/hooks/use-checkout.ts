'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { clientPost } from '@/lib/api/client';
import { rentalKeys } from '@/lib/hooks/use-rentals';
import type { CreateBookingRequest } from '@/types';

interface CreateBookingResponse {
    id: number;
    referenceNumber: string;
    status: string;
}

interface UseCreateBookingOptions {
    onSuccess?: (data: CreateBookingResponse) => void;
    onError?: (error: Error) => void;
}

async function createBooking(
    request: CreateBookingRequest
): Promise<CreateBookingResponse> {
    return clientPost<CreateBookingResponse>('/api/rentals', request);
}

export function useCreateBooking(options?: UseCreateBookingOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBooking,
        onSuccess: (data) => {
            void queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            options?.onSuccess?.(data);
        },
        onError: (error: Error) => {
            options?.onError?.(error);
        },
    });
}

export function useCheckoutNavigation() {
    const router = useRouter();

    return {
        goToSuccess: (bookingId: number | string) => {
            router.push(`/booking/success?ref=${bookingId}`);
        },
        goToFailure: (errorMessage?: string) => {
            const params = errorMessage
                ? `?error=${encodeURIComponent(errorMessage)}`
                : '';
            router.push(`/booking/failure${params}`);
        },
        goToCheckout: (params: {
            carId: number;
            startDate: string;
            endDate: string;
            pickupLocation?: string;
            dropoffLocation?: string;
        }) => {
            const searchParams = new URLSearchParams({
                carId: String(params.carId),
                startDate: params.startDate,
                endDate: params.endDate,
            });
            if (params.pickupLocation) {
                searchParams.set('pickupLocation', params.pickupLocation);
            }
            if (params.dropoffLocation) {
                searchParams.set('dropoffLocation', params.dropoffLocation);
            }
            router.push(`/checkout?${searchParams.toString()}`);
        },
    };
}

