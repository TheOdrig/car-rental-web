import type { LateReturnStatus } from '@/entities/rental';
import { ownValue } from '@/shared/lib/utils';

const LABELS: Record<string, LateReturnStatus> = {
    'On Time': 'ON_TIME',
    'Grace Period': 'GRACE_PERIOD',
    Late: 'LATE',
    'Severely Late': 'SEVERELY_LATE',
};

export function toLateReturnStatus(label: string | undefined): LateReturnStatus | undefined {
    return ownValue(LABELS, label);
}

interface WithStatus {
    status?: string;
}

export function mapLateReturnPage(data: unknown): unknown {
    const page = data as { content?: WithStatus[] } | undefined;

    if (!Array.isArray(page?.content)) {
        return data;
    }

    return {
        ...page,
        content: page.content.map((item) => ({ ...item, status: toLateReturnStatus(item.status) ?? item.status })),
    };
}
