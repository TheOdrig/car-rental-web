import 'server-only';
import { z } from 'zod';

const DEFAULT_API_URL = 'http://localhost:8082';

function buildSchema(isProduction: boolean) {
    const apiUrl = isProduction ? z.url() : z.url().default(DEFAULT_API_URL);

    return z.object({
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        API_URL: apiUrl.transform((value) => value.replace(/\/+$/, '')),
        JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    });
}

export type ServerEnv = z.infer<ReturnType<typeof buildSchema>>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
    const isProduction = source.NODE_ENV === 'production';
    const result = buildSchema(isProduction).safeParse({
        NODE_ENV: source.NODE_ENV,
        API_URL: source.API_URL || undefined,
        JWT_SECRET: source.JWT_SECRET || undefined,
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
