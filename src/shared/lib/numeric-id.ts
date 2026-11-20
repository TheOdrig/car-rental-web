export function isNumericId(value: string): boolean {
    return /^[0-9]+$/.test(value) && Number.isSafeInteger(Number(value));
}

export function parseNumericId(value: string | string[] | undefined | null): number {
    const raw = Array.isArray(value) ? value[0] : value;
    return raw !== undefined && raw !== null && isNumericId(raw) ? Number(raw) : Number.NaN;
}
