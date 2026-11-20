export const STATUS_TONES = ['success', 'warning', 'danger', 'info', 'primary', 'neutral'] as const;

export type StatusTone = (typeof STATUS_TONES)[number];

export interface StatusPresentation {
    label: string;
    tone: StatusTone;
}
