export const processKeys = {
    all: ['process-rentals'] as const,
    detail: (id: number) => [...processKeys.all, 'detail', id] as const,
    pending: () => [...processKeys.all, 'pending'] as const,
};