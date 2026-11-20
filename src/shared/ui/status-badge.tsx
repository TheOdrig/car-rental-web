'use client';

import * as React from 'react';

import type { StatusTone } from '@/shared/types';
import { Badge } from './badge';

type StatusBadgeProps = Omit<React.ComponentProps<typeof Badge>, 'variant'> & {
    tone: StatusTone;
};

export function StatusBadge({ tone, ...props }: StatusBadgeProps) {
    return <Badge variant={tone} {...props} />;
}
