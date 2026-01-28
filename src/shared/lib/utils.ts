export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const safeJSONParse = <T>(json: string, fallback: T): T => {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
};
