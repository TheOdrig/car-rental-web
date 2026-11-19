import { getApiErrorMessage } from './error';

const INTERNAL_PATH = /(?:^|[\s:'"(])(?:\/[\w.-]+){1,}|[A-Za-z]:\\|\\\\|\.java\b|\bat [\w$.]+\(/;

export function containsInternalDetail(text: string): boolean {
    return INTERNAL_PATH.test(text);
}

export function getSafeErrorMessage(error: unknown, fallback: string): string {
    const message = getApiErrorMessage(error);
    if (!message || containsInternalDetail(message)) return fallback;
    return message;
}
