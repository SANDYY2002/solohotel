import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-sm border border-stone-300 bg-white/60 px-4 text-sm text-stone-800 placeholder:text-stone-400",
        "dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-100 dark:placeholder:text-stone-500",
        "transition-colors duration-200 focus-visible:border-bronze-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400", className)} {...props} />
);

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-sm border border-stone-300 bg-white/60 px-3 text-sm text-stone-800",
        "dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-100",
        "transition-colors duration-200 focus-visible:border-bronze-400",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-sm border border-stone-300 bg-white/60 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400",
        "dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-100 dark:placeholder:text-stone-500",
        "transition-colors duration-200 focus-visible:border-bronze-400",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
