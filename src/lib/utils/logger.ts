const isDev = process.env.NODE_ENV === 'development';

export const logger = {
    log: (...args: unknown[]) => {
        if (isDev) {
            console.log('[DEV]', ...args);
        }
    },

    warn: (...args: unknown[]) => {
        if (isDev) {
            console.warn('[DEV]', ...args);
        }
    },

    error: (...args: unknown[]) => {
        console.error(...args);
    },

    debug: (...args: unknown[]) => {
        if (isDev) {
            console.debug('[DEBUG]', ...args);
        }
    },

    info: (...args: unknown[]) => {
        if (isDev) {
            console.info('[INFO]', ...args);
        }
    },
};
