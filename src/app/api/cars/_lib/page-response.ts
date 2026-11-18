import type { Schemas } from '@/shared/api';
import type { PageResponse } from '@/shared/types';

type CarListResponse = Schemas['CarListResponse'];

export function toPageResponse(data: unknown): PageResponse<NonNullable<CarListResponse['cars']>[number]> {
    const list = data as CarListResponse;

    return {
        content: list.cars ?? [],
        page: list.currentPage ?? 0,
        size: list.pageSize ?? 0,
        totalElements: list.totalElements ?? 0,
        totalPages: list.totalPages ?? 0,
    };
}
