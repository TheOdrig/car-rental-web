import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ownValue<T>(map: Readonly<Record<string, T>>, key: string | undefined | null): T | undefined {
  return typeof key === "string" && Object.hasOwn(map, key) ? map[key] : undefined;
}

export function pickCode<T extends string>(value: string | undefined | null, allowed: readonly T[]): T | undefined {
  return typeof value === "string" ? allowed.find((code) => code === value) : undefined;
}

export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}