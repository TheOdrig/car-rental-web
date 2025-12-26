import type { ValidationState, ValidationConfig } from '@/types/validation';

export function getValidationConfig(state: ValidationState): ValidationConfig {
    const configs: Record<ValidationState, ValidationConfig> = {
        idle: {
            state: 'idle',
            borderColor: 'border-input',
            backgroundColor: 'bg-transparent',
        },
        valid: {
            state: 'valid',
            borderColor: 'border-green-500',
            backgroundColor: 'bg-transparent',
            color: 'text-green-600',
        },
        invalid: {
            state: 'invalid',
            borderColor: 'border-destructive',
            backgroundColor: 'bg-transparent',
            color: 'text-destructive',
        },
        empty: {
            state: 'empty',
            borderColor: 'border-destructive',
            backgroundColor: 'bg-transparent',
            color: 'text-destructive',
        },
        focused: {
            state: 'focused',
            borderColor: 'border-ring',
            backgroundColor: 'bg-transparent',
        },
        disabled: {
            state: 'disabled',
            borderColor: 'border-input',
            backgroundColor: 'bg-muted',
            color: 'text-muted-foreground',
        },
        loading: {
            state: 'loading',
            borderColor: 'border-ring',
            backgroundColor: 'bg-transparent',
        },
    };

    return configs[state];
}

export function getValidationIcon(state: ValidationState): string {
    const icons: Record<ValidationState, string> = {
        idle: '',
        valid: '✓',
        invalid: '✗',
        empty: '!',
        focused: '',
        disabled: '',
        loading: 'spinner',
    };

    return icons[state];
}

export function getValidationAriaLabel(
    state: ValidationState,
    message?: string
): string {
    const labels: Record<ValidationState, string> = {
        idle: 'Input field',
        valid: 'Valid input',
        invalid: message ? `Invalid input: ${message}` : 'Invalid input: Please correct this field',
        empty: 'This field is required',
        focused: 'Input field focused',
        disabled: 'This field is disabled',
        loading: 'Validating input',
    };

    return labels[state];
}

export function getValidationBorderClasses(state: ValidationState): string {
    const config = getValidationConfig(state);
    return config.borderColor || 'border-input';
}

export function getValidationMessageClasses(state: ValidationState): string {
    if (state === 'valid') {
        return 'text-green-600 dark:text-green-500';
    }
    if (state === 'invalid' || state === 'empty') {
        return 'text-destructive';
    }
    return 'text-muted-foreground';
}

export function determineValidationState(options: {
    value: string;
    error?: string;
    isTouched?: boolean;
    isFocused?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
    isRequired?: boolean;
    isValid?: boolean;
}): ValidationState {
    const {
        value,
        error,
        isTouched,
        isFocused,
        isDisabled,
        isLoading,
        isRequired,
        isValid
    } = options;

    if (isDisabled) return 'disabled';
    if (isLoading) return 'loading';
    if (isFocused && !error) return 'focused';

    if (isTouched) {
        if (error) return 'invalid';
        if (isRequired && !value) return 'empty';
        if (isValid) return 'valid';
    }

    return 'idle';
}

export function getValidationRingClasses(state: ValidationState): string {
    switch (state) {
        case 'valid':
            return 'ring-green-500/20 focus-visible:ring-green-500/30';
        case 'invalid':
        case 'empty':
            return 'ring-destructive/20 focus-visible:ring-destructive/30';
        case 'focused':
        case 'loading':
            return 'ring-ring/50 focus-visible:ring-ring/50';
        default:
            return 'ring-ring/50 focus-visible:ring-ring/50';
    }
}
