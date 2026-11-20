export const processKeys = {
    all: ['process-rentals'] as const,
    detail: (id: number) => [...processKeys.all, 'detail', id] as const,
    earlyReturnPreview: (id: number) => [...processKeys.all, 'early-return-preview', id] as const,
    pending: () => [...processKeys.all, 'pending'] as const,
    list: (params: { page: number; userId?: number; status?: string }) => [...processKeys.all, 'list', params] as const,
};