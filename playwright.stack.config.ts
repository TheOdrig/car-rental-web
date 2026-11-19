import { defineConfig, devices } from '@playwright/test';

const webPort = process.env.E2E_WEB_PORT ?? '3100';
const apiUrl = process.env.E2E_API_URL ?? 'http://localhost:8082';
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${webPort}`;

export default defineConfig({
    testDir: './e2e-stack',
    fullyParallel: false,
    workers: 1,
    forbidOnly: true,
    retries: 0,
    timeout: 90_000,
    expect: { timeout: 20_000 },
    reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-stack' }]],
    outputDir: 'test-results-stack',
    use: {
        baseURL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: process.env.E2E_BASE_URL
        ? undefined
        : {
              command: `npx next dev -p ${webPort}`,
              url: `${baseURL}/api/health`,
              reuseExistingServer: true,
              timeout: 180_000,
              env: {
                  API_URL: apiUrl,
                  JWT_SECRET:
                      process.env.E2E_JWT_SECRET ??
                      'dev-only-jwt-secret-do-not-use-outside-local-development-0123456789',
                  NEXT_PUBLIC_APP_URL: baseURL,
                  TRUSTED_PROXY_HOPS: process.env.E2E_TRUSTED_PROXY_HOPS ?? '1',
              },
          },
});
