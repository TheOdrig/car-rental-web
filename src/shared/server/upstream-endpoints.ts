export type UpstreamMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type PathParamNames<T extends string> = T extends `${string}{${infer P}}${infer Rest}`
    ? P | PathParamNames<Rest>
    : never;

type ResolveArgs<T extends string> = [PathParamNames<T>] extends [never]
    ? []
    : [params: Record<PathParamNames<T>, string | number>];

export interface UpstreamTarget<M extends UpstreamMethod = UpstreamMethod> {
    method: M;
    path: string;
}

export interface UpstreamEndpoint<M extends UpstreamMethod = UpstreamMethod, T extends string = string> {
    method: M;
    template: T;
    resolve: (...args: ResolveArgs<T>) => UpstreamTarget<M>;
}

function endpoint<M extends UpstreamMethod, T extends string>(method: M, template: T): UpstreamEndpoint<M, T> {
    return {
        method,
        template,
        resolve: (...args: ResolveArgs<T>) => {
            const params = (args[0] ?? {}) as Record<string, string | number>;
            const path = template.replace(/\{([^}]+)\}/g, (_match, name: string) =>
                encodeURIComponent(String(params[name]))
            );
            return { method, path };
        },
    };
}

const V1 = '/api/v1';

export const API = {
    auth: {
        login: endpoint('POST', `${V1}/auth/login`),
        register: endpoint('POST', `${V1}/auth/register`),
        refresh: endpoint('POST', `${V1}/auth/refresh`),
        logout: endpoint('POST', `${V1}/auth/logout`),
        forgotPassword: endpoint('POST', `${V1}/auth/forgot-password`),
        resetPassword: endpoint('POST', `${V1}/auth/reset-password`),
    },
    oauth: {
        authorize: endpoint('GET', `${V1}/oauth2/authorize/{provider}`),
        callback: endpoint('GET', `${V1}/oauth2/callback/{provider}`),
    },
    cars: {
        list: endpoint('GET', `${V1}/cars`),
        search: endpoint('GET', `${V1}/cars/search`),
        byId: endpoint('GET', `${V1}/cars/{id}`),
        filterOptions: endpoint('GET', `${V1}/cars/filter-options`),
        availabilitySearch: endpoint('POST', `${V1}/cars/availability/search`),
        calendar: endpoint('GET', `${V1}/cars/{id}/availability/calendar`),
        similar: endpoint('GET', `${V1}/cars/{id}/similar`),
        create: endpoint('POST', `${V1}/cars`),
        update: endpoint('PUT', `${V1}/cars/{id}`),
        remove: endpoint('DELETE', `${V1}/cars/{id}`),
        softDelete: endpoint('DELETE', `${V1}/cars/{id}/soft`),
        restore: endpoint('POST', `${V1}/cars/{id}/restore`),
        updateStatus: endpoint('PATCH', `${V1}/cars/business/{id}/status`),
    },
    pricing: {
        preview: endpoint('GET', `${V1}/pricing/preview`),
    },
    exchangeRates: {
        list: endpoint('GET', `${V1}/exchange-rates`),
        refresh: endpoint('POST', `${V1}/exchange-rates/refresh`),
    },
    rentals: {
        me: endpoint('GET', `${V1}/rentals/me`),
        admin: endpoint('GET', `${V1}/rentals/admin`),
        byId: endpoint('GET', `${V1}/rentals/{id}`),
        request: endpoint('POST', `${V1}/rentals/request`),
        cancel: endpoint('POST', `${V1}/rentals/{id}/cancel`),
        earlyReturn: endpoint('POST', `${V1}/rentals/{id}/early-return`),
        payment: endpoint('GET', `${V1}/rentals/{id}/payment`),
        paymentIntent: endpoint('POST', `${V1}/rentals/{id}/payment-intent`),
    },
    damages: {
        me: endpoint('GET', `${V1}/damages/me`),
        dispute: endpoint('POST', `${V1}/damages/{id}/dispute`),
    },
    files: {
        avatar: endpoint('GET', `${V1}/files/avatars/{filename}`),
        damagePhoto: endpoint('GET', `${V1}/files/damage-photos/{filename}`),
    },
    users: {
        profile: endpoint('GET', `${V1}/users/me/profile`),
        updateProfile: endpoint('PUT', `${V1}/users/me/profile`),
        uploadAvatar: endpoint('POST', `${V1}/users/me/avatar`),
        deleteAvatar: endpoint('DELETE', `${V1}/users/me/avatar`),
        changePassword: endpoint('POST', `${V1}/users/me/password`),
    },
    admin: {
        alerts: endpoint('GET', `${V1}/admin/alerts`),
        acknowledgeAlert: endpoint('POST', `${V1}/admin/alerts/{id}/acknowledge`),
        cars: {
            search: endpoint('GET', `${V1}/admin/cars`),
            byId: endpoint('GET', `${V1}/admin/cars/{id}`),
        },
        carRentals: endpoint('GET', `${V1}/admin/cars/{id}/rentals`),
        dashboard: {
            summary: endpoint('GET', `${V1}/admin/dashboard/summary`),
            fleet: endpoint('GET', `${V1}/admin/dashboard/fleet`),
            revenue: endpoint('GET', `${V1}/admin/dashboard/revenue`),
            approvals: endpoint('GET', `${V1}/admin/dashboard/pending/approvals`),
            pickups: endpoint('GET', `${V1}/admin/dashboard/pending/pickups`),
            returns: endpoint('GET', `${V1}/admin/dashboard/pending/returns`),
            overdue: endpoint('GET', `${V1}/admin/dashboard/pending/overdue`),
        },
        quickActions: {
            approve: endpoint('POST', `${V1}/admin/quick-actions/rentals/{id}/approve`),
            reject: endpoint('POST', `${V1}/admin/quick-actions/rentals/{id}/reject`),
            pickup: endpoint('POST', `${V1}/admin/quick-actions/rentals/{id}/pickup`),
            return: endpoint('POST', `${V1}/admin/quick-actions/rentals/{id}/return`),
        },
        lateReturns: endpoint('GET', `${V1}/admin/late-returns`),
        lateReturnStatistics: endpoint('GET', `${V1}/admin/late-returns/statistics`),
        earlyReturnPreview: endpoint('GET', `${V1}/admin/rentals/{id}/early-return/preview`),
        penaltyHistory: endpoint('GET', `${V1}/admin/rentals/{id}/penalty/history`),
        penaltyWaive: endpoint('POST', `${V1}/admin/rentals/{id}/penalty/waive`),
        users: {
            list: endpoint('GET', `${V1}/admin/users`),
            stats: endpoint('GET', `${V1}/admin/users/stats`),
            byId: endpoint('GET', `${V1}/admin/users/{id}`),
            ban: endpoint('POST', `${V1}/admin/users/{id}/ban`),
            unban: endpoint('POST', `${V1}/admin/users/{id}/unban`),
            notes: endpoint('GET', `${V1}/admin/users/{id}/notes`),
            addNote: endpoint('POST', `${V1}/admin/users/{id}/notes`),
            rentals: endpoint('GET', `${V1}/admin/users/{id}/rentals`),
        },
        damages: {
            search: endpoint('GET', `${V1}/admin/damages/search`),
            create: endpoint('POST', `${V1}/admin/damages`),
            byId: endpoint('GET', `${V1}/admin/damages/{id}`),
            assess: endpoint('POST', `${V1}/admin/damages/{id}/assess`),
            updateAssessment: endpoint('PUT', `${V1}/admin/damages/{id}/assess`),
            resolve: endpoint('POST', `${V1}/admin/damages/{id}/resolve`),
            charge: endpoint('POST', `${V1}/admin/damages/{id}/charge`),
            uploadPhotos: endpoint('POST', `${V1}/admin/damages/{id}/photos`),
            deletePhoto: endpoint('DELETE', `${V1}/admin/damages/{id}/photos/{photoId}`),
            statistics: endpoint('GET', `${V1}/admin/damages/statistics`),
            byVehicle: endpoint('GET', `${V1}/admin/damages/vehicle/{carId}`),
            byCustomer: endpoint('GET', `${V1}/admin/damages/customer/{userId}`),
        },
    },
} as const;

type Registry = typeof API;

function collect(node: unknown, found: UpstreamEndpoint[] = []): UpstreamEndpoint[] {
    if (node && typeof node === 'object') {
        if ('template' in node && 'method' in node && 'resolve' in node) {
            found.push(node as UpstreamEndpoint);
        } else {
            Object.values(node).forEach((child) => collect(child, found));
        }
    }
    return found;
}

export function listUpstreamEndpoints(registry: Registry = API): UpstreamEndpoint[] {
    return collect(registry);
}
