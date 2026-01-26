import { describe, it, expect, beforeEach } from 'vitest';
import { createMockCar, createMockUser, resetMockFactories } from '../factories';
import { createTestQueryClient, createRouteParams, createMockResponse } from '../test-utils';

describe('Test Infrastructure', () => {
    beforeEach(() => {
        resetMockFactories();
    });

    describe('Mock Factories', () => {
        it('should create mock car with default values', () => {
            const car = createMockCar();

            expect(car.id).toBe(1);
            expect(car.brand).toBe('Toyota');
            expect(car.model).toBe('Corolla');
            expect(car.carStatusType).toBe('Available');
        });

        it('should create mock car with overrides', () => {
            const car = createMockCar({ brand: 'Honda', model: 'Civic' });

            expect(car.brand).toBe('Honda');
            expect(car.model).toBe('Civic');
        });

        it('should create mock user with default values', () => {
            const user = createMockUser();

            expect(user.id).toBe(1);
            expect(user.roles).toContain('USER');
        });

        it('should increment IDs for each factory call', () => {
            const car1 = createMockCar();
            const car2 = createMockCar();

            expect(car1.id).toBe(1);
            expect(car2.id).toBe(2);
        });

        it('should reset IDs with resetMockFactories', () => {
            createMockCar();
            createMockCar();
            resetMockFactories();
            const car = createMockCar();

            expect(car.id).toBe(1);
        });
    });

    describe('Test Utilities', () => {
        it('should create QueryClient with disabled retries', () => {
            const queryClient = createTestQueryClient();

            expect(queryClient).toBeDefined();
            expect(queryClient.getDefaultOptions().queries?.retry).toBe(false);
        });

        it('should create Promise-wrapped route params', async () => {
            const params = createRouteParams({ id: '123' });

            expect(params).toBeInstanceOf(Promise);
            await expect(params).resolves.toEqual({ id: '123' });
        });

        it('should create mock response', async () => {
            const data = { message: 'success' };
            const response = createMockResponse(data);

            expect(response.ok).toBe(true);
            expect(response.status).toBe(200);
            await expect(response.json()).resolves.toEqual(data);
        });

        it('should create mock error response', async () => {
            const response = createMockResponse(
                { message: 'Not found' },
                { status: 404, ok: false }
            );

            expect(response.ok).toBe(false);
            expect(response.status).toBe(404);
        });
    });
});

