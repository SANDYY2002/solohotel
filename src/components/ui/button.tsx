import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium tracking-wide transition-all duration-300 ease-signature disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary:
          "bg-conservatory-900 text-stone-50 hover:bg-conservatory-800 dark:bg-bronze-400 dark:text-ink dark:hover:bg-bronze-300",
        bronze: "btn-shimmer text-ink shadow-glass hover:shadow-glass-lg",
        outline:
          "border border-conservatory-900/30 text-conservatory-900 hover:bg-conservatory-900/5 dark:border-stone-200/30 dark:text-stone-100 dark:hover:bg-white/5",
        ghost: "text-stone-700 hover:bg-stone-900/5 dark:text-stone-200 dark:hover:bg-white/10",
        link: "text-bronze-500 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { buttonVariants };
