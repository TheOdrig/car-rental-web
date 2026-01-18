import * as React from "react"
import { cn } from "@/lib/utils"
import type { ValidationState } from "@/types/validation"

interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
  success?: string;
  isLoading?: boolean;
  validationState?: ValidationState;
}

function Input({
  className,
  type,
  error,
  success,
  isLoading,
  validationState = 'idle',
  disabled,
  ...props
}: InputProps) {
  const effectiveState: ValidationState = React.useMemo(() => {
    if (disabled) return 'disabled';
    if (isLoading) return 'loading';
    if (error) return 'invalid';
    if (success) return 'valid';
    return validationState;
  }, [disabled, isLoading, error, success, validationState]);

  return (
    <input
      type={type}
      data-slot="input"
      data-validation-state={effectiveState}
      disabled={disabled}
      aria-invalid={effectiveState === 'invalid' || effectiveState === 'empty' || undefined}
      aria-busy={effectiveState === 'loading' || undefined}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "h-9 w-full min-w-0 rounded-md border bg-white dark:bg-slate-900/50 px-3 py-1 text-base",
        "shadow-xs transition-all duration-200 outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",

        "focus-visible:ring-[3px]",

        effectiveState === 'idle' && "border-input focus-visible:border-ring focus-visible:ring-ring/50",
        effectiveState === 'valid' && "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20",
        effectiveState === 'invalid' && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
        effectiveState === 'empty' && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
        effectiveState === 'loading' && "border-ring focus-visible:border-ring focus-visible:ring-ring/50",
        effectiveState === 'disabled' && "border-input bg-muted",
        effectiveState === 'focused' && "border-ring focus-visible:ring-ring/50",

        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",

        className
      )}
      {...props}
    />
  )
}

export { Input }
export type { InputProps }
