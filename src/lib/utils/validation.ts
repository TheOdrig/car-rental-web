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
  if (!password) {
    return 'weak';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return 'weak';
  }

  const commonPasswords = [
    'password', 'password1', 'password123',
    '12345678', '123456789', '1234567890',
    'qwerty', 'qwertyui', 'qwertyuiop',
    'abcdefgh', 'abcd1234', 'admin123',
    'letmein', 'welcome', 'monkey', 'dragon',
    'master', 'login', 'abc123', 'iloveyou',
  ];

  const lowerPassword = password.toLowerCase();
  if (commonPasswords.includes(lowerPassword)) {
    return 'weak';
  }

  const hasSequentialNumbers = /(?:012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/.test(password);
  const hasSequentialLetters = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);

  const hasRepeatedChars = /(.)\1{2,}/.test(password);

  const hasKeyboardPattern = /(?:qwerty|asdfgh|zxcvbn|qazwsx|1qaz|2wsx)/i.test(password);

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const typesCount = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;

  const hasWeakPattern = hasSequentialNumbers || hasSequentialLetters || hasRepeatedChars || hasKeyboardPattern;

  if (typesCount <= 1) {
    return 'weak';
  }

  if (hasWeakPattern) {
    return 'fair';
  }
  const isLong = password.length >= 12;

  if (typesCount === 2) {
    return isLong ? 'good' : 'fair';
  }

  if (typesCount === 3) {
    return isLong ? 'strong' : 'good';
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

