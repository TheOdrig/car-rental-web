const STATUS_MESSAGES: Record<string, string> = {
    maintenance: 'This car is in maintenance and cannot be booked right now.',
    damaged: 'This car is being repaired and cannot be booked right now.',
    inspection: 'This car is being inspected and cannot be booked right now.',
    rented: 'This car is currently rented out.',
    reserved: 'This car is currently reserved.',
};

const DEFAULT_MESSAGE = 'This car is not available for booking right now.';

export function getCarUnavailableMessage(status: string | null | undefined): string {
    if (!status) return DEFAULT_MESSAGE;
    return STATUS_MESSAGES[status.toLowerCase()] ?? DEFAULT_MESSAGE;
}

export function friendlyUnavailableReason(raw: string | null | undefined): string {
    if (!raw) return DEFAULT_MESSAGE;
    const match = /status is:?\s*([A-Za-z]+)/i.exec(raw);
    if (match) return getCarUnavailableMessage(match[1]);
    const word = Object.keys(STATUS_MESSAGES).find((key) => raw.toLowerCase().includes(key));
    return word ? STATUS_MESSAGES[word] : DEFAULT_MESSAGE;
}
