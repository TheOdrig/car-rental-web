import type { PasswordStrength } from '@/types/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(email: string): boolean {
  if (!email) {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
}


export function validatePassword(password: string): boolean {
  if (!password) {
    return false;
  }
  return password.length >= MIN_PASSWORD_LENGTH;
}


export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return 'weak';
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const typesCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  if (typesCount <= 1) {
    return 'fair';
  }
  
  if (typesCount === 2 || typesCount === 3) {
    return 'good';
  }
  
  return 'strong';
}

export function getPasswordStrengthColor(strength: PasswordStrength): string {
  const colors: Record<PasswordStrength, string> = {
    weak: 'bg-red-500',
    fair: 'bg-orange-500',
    good: 'bg-yellow-500',
    strong: 'bg-green-500',
  };
  return colors[strength];
}

export function getPasswordStrengthTextColor(strength: PasswordStrength): string {
  const colors: Record<PasswordStrength, string> = {
    weak: 'text-red-500',
    fair: 'text-orange-500',
    good: 'text-yellow-500',
    strong: 'text-green-500',
  };
  return colors[strength];
}

export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  const labels: Record<PasswordStrength, string> = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };
  return labels[strength];
}

export function getPasswordStrengthProgress(strength: PasswordStrength): number {
  const progress: Record<PasswordStrength, number> = {
    weak: 25,
    fair: 50,
    good: 75,
    strong: 100,
  };
  return progress[strength];
}

export function getPasswordSuggestions(password: string): string[] {
  const suggestions: string[] = [];

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    suggestions.push(`Use at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add uppercase letters (A-Z)');
  }

  if (!/[a-z]/.test(password)) {
    suggestions.push('Add lowercase letters (a-z)');
  }

  if (!/\d/.test(password)) {
    suggestions.push('Add numbers (0-9)');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('Add special characters (!@#$%^&*)');
  }

  return suggestions;
}

export const ValidationMessages = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    tooShort: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    weak: 'Password is too weak',
  },
  confirmPassword: {
    required: 'Please confirm your password',
    mismatch: 'Passwords do not match',
  },
  terms: {
    required: 'You must accept the terms and conditions',
  },
} as const;
