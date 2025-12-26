import * as React from "react"
import { cn } from "@/lib/utils"
import type { ValidationState } from "@/types/validation"
import { getValidationBorderClasses, getValidationRingClasses } from "@/lib/utils/validation-ui"

interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: string;
  success?: string;
  isLoading?: boolean;
  validationState?: ValidationState;
}

function Textarea({
  className,
  error,
  success,
  isLoading,
  validationState = 'idle',
  disabled,
  ...props
}: TextareaProps) {
  const effectiveState: ValidationState = React.useMemo(() => {
    if (disabled) return 'disabled';
    if (isLoading) return 'loading';
    if (error) return 'invalid';
    if (success) return 'valid';
    return validationState;
  }, [disabled, isLoading, error, success, validationState]);

  return (
    <textarea
      data-slot="textarea"
      data-validation-state={effectiveState}
      disabled={disabled}
      aria-invalid={effectiveState === 'invalid' || effectiveState === 'empty' || undefined}
      aria-busy={effectiveState === 'loading' || undefined}
      className={cn(
        "placeholder:text-muted-foreground dark:bg-input/30",
        "flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent",
        "px-3 py-2 text-base shadow-xs transition-all duration-200 outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
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

export { Textarea }
export type { TextareaProps }
