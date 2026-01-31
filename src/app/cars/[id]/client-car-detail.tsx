'use client';

import { useState } from 'react';
import { CarDetail, useCarCalendar, type Car, type CarAvailabilityCalendar } from '@/entities/car';

interface ClientCarDetailProps {
    car: Car;
    initialCalendar: CarAvailabilityCalendar | undefined;
    actionSlot?: React.ReactNode;
}

export function ClientCarDetail({ car, initialCalendar, actionSlot }: ClientCarDetailProps) {
    const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
        initialCalendar?.month || undefined
    );

    const { data: calendarData, isLoading } = useCarCalendar(
        car.id,
        selectedMonth
    );

    const calendar = calendarData || initialCalendar;

    return (
        <CarDetail
            car={car}
            calendar={calendar}
            isCalendarLoading={isLoading}
            onMonthChange={setSelectedMonth}
            actionSlot={actionSlot}
        />
    );
}