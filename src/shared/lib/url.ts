export function withQuery(path: string, query: string | undefined): string {
    return query ? `${path}?${query}` : path;
}
