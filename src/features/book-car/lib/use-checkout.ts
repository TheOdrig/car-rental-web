'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientPost } from '@/shared/api';
import { rentalKeys, type Rental } from '@/entities/rental';
import type { CreateBookingRequest } from '../model/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

type CreateBookingResponse = Pick<Rental, 'id'>;

interface UseCreateBookingOptions {
    onSuccess?: (data: CreateBookingResponse) => void;
    onError?: (error: Error) => void;
}

async function createBooking(
    request: CreateBookingRequest
): Promise<CreateBookingResponse> {
    return clientPost<CreateBookingResponse>(ENDPOINTS.rentals.root, request);
}

export function useCreateBooking(options?: UseCreateBookingOptions) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBooking,
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: rentalKeys.all });
            options?.onSuccess?.(data);
        },
        onError: (error: Error) => {
            options?.onError?.(error);
        },
    });
}
