export function focusFirstInvalid(order: readonly string[], errors: Record<string, string>): void {
    const first = order.find((id) => Boolean(errors[id]));
    if (first) {
        setTimeout(() => document.getElementById(first)?.focus(), 0);
    }
}
