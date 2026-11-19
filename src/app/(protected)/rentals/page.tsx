import type { Metadata } from 'next';
import { MyRentalsContent } from './my-rentals-content';

export const metadata: Metadata = { title: 'My Rentals' };

export default function MyRentalsPage() {
    return <MyRentalsContent />;
}
