export const RESET_LINK_EXPIRED = 'This password reset link has expired. Please request a new one.';
export const RESET_LINK_INVALID =
    'This password reset link is not valid. It may have expired or already been used. Please request a new one.';

export function describeResetLinkError(message: string): { title: string; detail: string } | null {
    const lower = message.toLowerCase();

    if (lower.includes('invalid') || lower.includes('used')) {
        return { title: 'Link not valid', detail: RESET_LINK_INVALID };
    }

    if (lower.includes('expired')) {
        return { title: 'Link expired', detail: RESET_LINK_EXPIRED };
    }

    return null;
}
