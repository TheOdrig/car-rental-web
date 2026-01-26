import { describe, it, expect } from 'vitest';
import {
    getValidationConfig,
    getValidationIcon,
    getValidationAriaLabel,
    getValidationBorderClasses,
    getValidationMessageClasses,
    determineValidationState,
    getValidationRingClasses,
} from '@/lib/utils/validation-ui';

describe('validation-ui utilities', () => {
    describe('getValidationConfig', () => {
        it('should return idle config by default', () => {
            const config = getValidationConfig('idle');
            expect(config.state).toBe('idle');
            expect(config.borderColor).toBe('border-input');
        });

        it('should return valid config with green color', () => {
            const config = getValidationConfig('valid');
            expect(config.state).toBe('valid');
            expect(config.borderColor).toBe('border-green-500');
            expect(config.color).toBe('text-green-600');
        });

        it('should return invalid config with destructive color', () => {
            const config = getValidationConfig('invalid');
            expect(config.state).toBe('invalid');
            expect(config.borderColor).toBe('border-destructive');
            expect(config.color).toBe('text-destructive');
        });

        it('should return empty config with destructive color', () => {
            const config = getValidationConfig('empty');
            expect(config.state).toBe('empty');
            expect(config.borderColor).toBe('border-destructive');
        });

        it('should return disabled config with muted color', () => {
            const config = getValidationConfig('disabled');
            expect(config.state).toBe('disabled');
            expect(config.backgroundColor).toBe('bg-muted');
            expect(config.color).toBe('text-muted-foreground');
        });

        it('should return loading config with ring color', () => {
            const config = getValidationConfig('loading');
            expect(config.state).toBe('loading');
            expect(config.borderColor).toBe('border-ring');
        });
    });

    describe('getValidationIcon', () => {
        it('should return checkmark for valid state', () => {
            expect(getValidationIcon('valid')).toBe('✓');
        });

        it('should return X for invalid state', () => {
            expect(getValidationIcon('invalid')).toBe('✗');
        });

        it('should return exclamation for empty state', () => {
            expect(getValidationIcon('empty')).toBe('!');
        });

        it('should return spinner for loading state', () => {
            expect(getValidationIcon('loading')).toBe('spinner');
        });

        it('should return empty string for idle state', () => {
            expect(getValidationIcon('idle')).toBe('');
        });

        it('should return empty string for focused state', () => {
            expect(getValidationIcon('focused')).toBe('');
        });
    });

    describe('getValidationAriaLabel', () => {
        it('should return valid input label for valid state', () => {
            expect(getValidationAriaLabel('valid')).toBe('Valid input');
        });

        it('should return invalid input label with message', () => {
            expect(getValidationAriaLabel('invalid', 'Email is required')).toBe('Invalid input: Email is required');
        });

        it('should return default invalid message when no message provided', () => {
            expect(getValidationAriaLabel('invalid')).toBe('Invalid input: Please correct this field');
        });

        it('should return required message for empty state', () => {
            expect(getValidationAriaLabel('empty')).toBe('This field is required');
        });

        it('should return disabled message for disabled state', () => {
            expect(getValidationAriaLabel('disabled')).toBe('This field is disabled');
        });

        it('should return validating message for loading state', () => {
            expect(getValidationAriaLabel('loading')).toBe('Validating input');
        });
    });

    describe('getValidationBorderClasses', () => {
        it('should return green border for valid state', () => {
            expect(getValidationBorderClasses('valid')).toBe('border-green-500');
        });

        it('should return destructive border for invalid state', () => {
            expect(getValidationBorderClasses('invalid')).toBe('border-destructive');
        });

        it('should return input border for idle state', () => {
            expect(getValidationBorderClasses('idle')).toBe('border-input');
        });
    });

    describe('getValidationMessageClasses', () => {
        it('should return green text for valid state', () => {
            expect(getValidationMessageClasses('valid')).toContain('text-green');
        });

        it('should return destructive text for invalid state', () => {
            expect(getValidationMessageClasses('invalid')).toBe('text-destructive');
        });

        it('should return destructive text for empty state', () => {
            expect(getValidationMessageClasses('empty')).toBe('text-destructive');
        });

        it('should return muted text for idle state', () => {
            expect(getValidationMessageClasses('idle')).toBe('text-muted-foreground');
        });
    });

    describe('determineValidationState', () => {
        it('should return disabled when isDisabled is true', () => {
            const state = determineValidationState({
                value: 'test',
                isDisabled: true,
            });
            expect(state).toBe('disabled');
        });

        it('should return loading when isLoading is true', () => {
            const state = determineValidationState({
                value: 'test',
                isLoading: true,
            });
            expect(state).toBe('loading');
        });

        it('should return focused when isFocused is true and no error', () => {
            const state = determineValidationState({
                value: 'test',
                isFocused: true,
                isTouched: true,
            });
            expect(state).toBe('focused');
        });

        it('should return invalid when error exists and touched', () => {
            const state = determineValidationState({
                value: 'test',
                error: 'Invalid email',
                isTouched: true,
            });
            expect(state).toBe('invalid');
        });

        it('should return empty when required field is empty and touched', () => {
            const state = determineValidationState({
                value: '',
                isRequired: true,
                isTouched: true,
            });
            expect(state).toBe('empty');
        });

        it('should return valid when isValid is true and touched', () => {
            const state = determineValidationState({
                value: 'valid value',
                isValid: true,
                isTouched: true,
            });
            expect(state).toBe('valid');
        });

        it('should return idle when not touched', () => {
            const state = determineValidationState({
                value: 'test',
                error: 'Some error',
                isTouched: false,
            });
            expect(state).toBe('idle');
        });

        it('should prioritize disabled over loading', () => {
            const state = determineValidationState({
                value: 'test',
                isDisabled: true,
                isLoading: true,
            });
            expect(state).toBe('disabled');
        });

        it('should prioritize loading over focused', () => {
            const state = determineValidationState({
                value: 'test',
                isLoading: true,
                isFocused: true,
            });
            expect(state).toBe('loading');
        });
    });

    describe('getValidationRingClasses', () => {
        it('should return green ring for valid state', () => {
            const classes = getValidationRingClasses('valid');
            expect(classes).toContain('ring-green-500');
        });

        it('should return destructive ring for invalid state', () => {
            const classes = getValidationRingClasses('invalid');
            expect(classes).toContain('ring-destructive');
        });

        it('should return destructive ring for empty state', () => {
            const classes = getValidationRingClasses('empty');
            expect(classes).toContain('ring-destructive');
        });

        it('should return ring-ring for idle state', () => {
            const classes = getValidationRingClasses('idle');
            expect(classes).toContain('ring-ring');
        });
    });
});

