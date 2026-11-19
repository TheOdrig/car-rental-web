import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export { http, HttpResponse };

export const server = setupServer();

export function installMockApi(): void {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());
}
