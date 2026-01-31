import type { Metadata } from 'next';
import React from "react";

export const metadata: Metadata = {
    title: {
        template: '%s | Car Rental',
        default: 'Browse Cars | Car Rental',
    },
    description: 'Browse and rent cars from our extensive fleet',
};

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
