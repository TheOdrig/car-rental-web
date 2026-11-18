import 'server-only';
import { z } from 'zod';

const DEFAULT_API_URL = 'http://localhost:8082';
const DEFAULT_API_TIMEOUT_MS = 5000;

const stripePublishableKey = z
    .string()
    .regex(/^pk_test_[A-Za-z0-9_]+$/, 'STRIPE_PUBLISHABLE_KEY must be a Stripe test-mode key starting with pk_test_')
    .optional();

function buildSchema(isProduction: boolean) {
    const apiUrl = isProduction ? z.url() : z.url().default(DEFAULT_API_URL);

    return z.object({
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        API_URL: apiUrl.transform((value) => value.replace(/\/+$/, '')),
        API_TIMEOUT_MS: z.coerce.number().int().positive().default(DEFAULT_API_TIMEOUT_MS),
        JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
        STRIPE_PUBLISHABLE_KEY: stripePublishableKey,
    });
}

export type ServerEnv = z.infer<ReturnType<typeof buildSchema>>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
    const isProduction = source.NODE_ENV === 'production';
    const result = buildSchema(isProduction).safeParse({
        NODE_ENV: source.NODE_ENV,
        API_URL: source.API_URL || undefined,
        API_TIMEOUT_MS: source.API_TIMEOUT_MS || undefined,
        JWT_SECRET: source.JWT_SECRET || undefined,
        STRIPE_PUBLISHABLE_KEY: source.STRIPE_PUBLISHABLE_KEY?.trim() || undefined,
    });

    if (!result.success) {
        const details = result.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join('; ');
        throw new Error(`Invalid server environment: ${details}`);
    }

    return result.data;
}

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
    cached ??= parseServerEnv(process.env);
    return cached;
}

export function resetServerEnvForTests(): void {
    cached = undefined;
}
