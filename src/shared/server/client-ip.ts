import 'server-only';
import { isIP } from 'node:net';
import { headers as requestHeaders } from 'next/headers';
import { getServerEnv } from './env';

export const CLIENT_IP_HEADER = 'X-Client-IP';

export interface ClientIpRule {
    trustedProxyHops: number;
    trustedClientIpHeader?: string;
}

type HeaderSource = Pick<Headers, 'get'>;

function normalize(value: string): string | undefined {
    const candidate = value.trim().toLowerCase();
    return candidate.length <= 45 && isIP(candidate) !== 0 ? candidate : undefined;
}

export function resolveClientIp(source: HeaderSource, rule: ClientIpRule): string | undefined {
    const trustedHeader = rule.trustedClientIpHeader?.trim();
    if (trustedHeader) {
        const value = source.get(trustedHeader);
        const address = value ? normalize(value) : undefined;
        if (address) {
            return address;
        }
    }

    if (rule.trustedProxyHops < 1) {
        return undefined;
    }

    const entries = (source.get('x-forwarded-for') ?? '').split(',').map((entry) => entry.trim());
    const index = entries.length - rule.trustedProxyHops;
    return index >= 0 ? normalize(entries[index]) : undefined;
}

export function clientIpRuleFromEnv(): ClientIpRule {
    const env = getServerEnv();
    return {
        trustedProxyHops: env.TRUSTED_PROXY_HOPS,
        trustedClientIpHeader: env.TRUSTED_CLIENT_IP_HEADER,
    };
}

export function clientIpFromRequestHeaders(source: HeaderSource): string | undefined {
    return resolveClientIp(source, clientIpRuleFromEnv());
}

export async function clientIpHeaders(clientIp?: string): Promise<Record<string, string>> {
    const address = clientIp ?? (await currentClientIp());
    return address ? { [CLIENT_IP_HEADER]: address } : {};
}

export async function currentClientIp(): Promise<string | undefined> {
    try {
        return clientIpFromRequestHeaders(await requestHeaders());
    } catch {
        return undefined;
    }
}
