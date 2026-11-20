export interface PageSlice<T> {
    items: T[];
    totalPages: number;
    currentPage: number;
}

export function paginate<T>(list: readonly T[], page: number, size: number): PageSlice<T> {
    const totalPages = Math.max(1, Math.ceil(list.length / size));
    const currentPage = Math.min(Math.max(page, 0), totalPages - 1);
    return {
        items: list.slice(currentPage * size, (currentPage + 1) * size),
        totalPages,
        currentPage,
    };
}

export function parsePageIndex(value: string | null | undefined): number {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 1 ? parsed - 1 : 0;
}
