import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const nodeTests = [
    'src/shared/server/**/__tests__/**/*.test.{ts,tsx}',
    'src/__tests__/proxy.test.ts',
];

export default defineConfig({
    plugins: [react()],
    test: {
        testTimeout: 15000,
        allowOnly: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/tests/setup.ts',
                'src/tests/test-utils.tsx',
                'src/tests/factories.ts',
                '**/*.test.{ts,tsx}',
                '**/*.d.ts',
                '**/*.config.*',
                '**/components/ui/**',
            ],
        },
        projects: [
            {
                extends: true,
                test: {
                    name: 'dom',
                    environment: 'jsdom',
                    globals: true,
                    setupFiles: ['./src/app/setup-tests.ts'],
                    include: [
                        'src/__tests__/**/*.test.{ts,tsx}',
                        'src/features/**/__tests__/**/*.test.{ts,tsx}',
                        'src/entities/**/__tests__/**/*.test.{ts,tsx}',
                        'src/shared/**/__tests__/**/*.test.{ts,tsx}',
                        'src/widgets/**/__tests__/**/*.test.{ts,tsx}',
                        'src/app/**/__tests__/**/*.test.{ts,tsx}',
                    ],
                    exclude: ['node_modules', 'dist', '.next', ...nodeTests],
                },
            },
            {
                extends: true,
                test: {
                    name: 'node',
                    environment: 'node',
                    globals: true,
                    setupFiles: ['./src/app/setup-node-tests.ts'],
                    include: nodeTests,
                    exclude: ['node_modules', 'dist', '.next'],
                },
            },
        ],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'server-only': path.resolve(__dirname, './src/app/testing/server-only.ts'),
        },
    },
});
