import type { Metadata } from 'next';
import React from "react";

export const metadata: Metadata = {
    title: {
        template: '%s | Car Rental',
        default: 'Browse Cars | Car Rental',
    },
    description: 'Browse and rent premium vehicles from our extensive fleet. Find the perfect car for your journey.',
};

export default function CarsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
