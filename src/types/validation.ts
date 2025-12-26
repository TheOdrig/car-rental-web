import type { ReactNode } from 'react';

export type ValidationState = 
  | 'idle' 
  | 'valid' 
  | 'invalid' 
  | 'empty' 
  | 'focused' 
  | 'disabled' 
  | 'loading';

export interface ValidationConfig {
  state: ValidationState;
  message?: string;
  icon?: ReactNode;
  color?: string;
  borderColor?: string;
  backgroundColor?: string;
}

export interface FormFieldState {
  value: string;
  validationState: ValidationState;
  error?: string;
  success?: string;
  isLoading?: boolean;
  isFocused?: boolean;
  isDisabled?: boolean;
  isTouched?: boolean;
}

export interface ValidationDisplayProps {
  state: ValidationState;
  message?: string;
  showIcon?: boolean;
  className?: string;
}
