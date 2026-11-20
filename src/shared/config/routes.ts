type Id = string | number;
type MaybeId = Id | null | undefined;

const detail = (base: string, id: MaybeId) => (id === null || id === undefined ? base : `${base}/${id}`);

export const ROUTES = {
    home: '/',
    login: '/login',
    loginWithCallback: (callbackUrl: string) => `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    loginWithError: (error: string) => `/login?error=${error}`,
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    forbidden: '/forbidden',
    terms: '/terms',
    privacy: '/privacy',
    search: '/search',
    checkout: '/checkout',
    dashboard: '/dashboard',
    help: {
        booking: '/help/booking',
        faq: '/help/faq',
    },
    booking: {
        root: '/booking',
        success: (reference: Id) => `/booking/success?ref=${reference}`,
    },
    cars: {
        list: '/cars',
        detail: (id: MaybeId) => detail('/cars', id),
    },
    rentals: {
        list: '/rentals',
        detail: (id: Id) => `/rentals/${id}`,
        pay: (id: Id) => `/rentals/${id}/pay`,
    },
    damages: {
        list: '/damages',
        detail: (id: Id) => `/damages/${id}`,
    },
    settings: {
        root: '/settings',
        profile: '/settings/profile',
        security: '/settings/security',
        payment: '/settings/payment',
    },
    admin: {
        root: '/admin',
        dashboard: '/admin/dashboard',
        alerts: '/admin/alerts',
        fleet: '/admin/fleet',
        fleetNew: '/admin/fleet/new',
        fleetDetail: (id: MaybeId) => detail('/admin/fleet', id),
        fleetEdit: (id: Id) => `/admin/fleet/${id}/edit`,
        users: '/admin/users',
        user: (id: MaybeId) => detail('/admin/users', id),
        rentals: '/admin/rentals',
        rental: (id: Id) => `/admin/rentals/${id}`,
        rentalsOfUser: (userId: Id) => `/admin/rentals?userId=${userId}`,
        damages: '/admin/damages',
        damage: (id: MaybeId) => detail('/admin/damages', id),
        damagesOfUser: (userId: Id) => `/admin/damages?userId=${userId}`,
        damagesOfCar: (carId: Id) => `/admin/damages?carId=${carId}`,
        damageStatistics: '/admin/damages/statistics',
        lateReturns: '/admin/late-returns',
        lateReturnStatistics: '/admin/late-returns/statistics',
    },
} as const;
