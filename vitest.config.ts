import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/app/setup-tests.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        testTimeout: 15000,
        exclude: ['node_modules', 'dist', '.next'],
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
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
