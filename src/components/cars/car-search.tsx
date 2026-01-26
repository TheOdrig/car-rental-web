'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface CarSearchProps {
    className?: string;
    variant?: 'default' | 'compact' | 'hero';
    onSearch?: (startDate: Date, endDate: Date) => void;
}

export function CarSearch({ className, variant = 'default', onSearch }: CarSearchProps) {
    const router = useRouter();
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!startDate || !endDate) return;

        if (onSearch) {
            onSearch(startDate, endDate);
        } else {
            const params = new URLSearchParams({
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
            });
            router.push(`/search?${params.toString()}`);
        }
    };

    const isValid = startDate && endDate && startDate < endDate;

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'flex gap-3',
                variant === 'hero' && 'flex-col sm:flex-row',
                variant === 'compact' && 'flex-wrap',
                className
            )}
        >
            <Popover open={startOpen} onOpenChange={setStartOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'justify-start text-left font-normal',
                            variant === 'hero' ? 'w-full sm:w-[200px]' : 'w-[180px]',
                            !startDate && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Pick-up date'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                            setStartDate(date);
                            setStartOpen(false);
                            if (date && (!endDate || endDate <= date)) {
                                const nextDay = new Date(date);
                                nextDay.setDate(nextDay.getDate() + 1);
                                setEndDate(nextDay);
                            }
                        }}
                        disabled={(date) => date < today}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>

            <Popover open={endOpen} onOpenChange={setEndOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'justify-start text-left font-normal',
                            variant === 'hero' ? 'w-full sm:w-[200px]' : 'w-[180px]',
                            !endDate && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Return date'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                            setEndDate(date);
                            setEndOpen(false);
                        }}
                        disabled={(date) => date < today || (startDate ? date <= startDate : false)}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>

            <Button
                type="submit"
                disabled={!isValid}
                className={cn(variant === 'hero' && 'w-full sm:w-auto')}
            >
                <Search className="h-4 w-4 mr-2" />
                Search
            </Button>
        </form>
    );
}

