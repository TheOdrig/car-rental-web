import { z } from 'zod';
import { User } from '@/entities/user';

export const LoginSchema = z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const RegisterSchema = z.object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    phone: z.string().min(10, { message: 'Invalid phone number' }),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;

export interface AuthResponse {
    token: string;
    user: User;
}
