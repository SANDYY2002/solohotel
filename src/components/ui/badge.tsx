import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-widest2",
  {
    variants: {
      variant: {
        default: "bg-conservatory-900 text-stone-50 dark:bg-bronze-400 dark:text-ink",
        outline: "border border-current text-conservatory-700 dark:text-stone-200",
        soft: "bg-bronze-100 text-bronze-700 dark:bg-bronze-900/40 dark:text-bronze-200",
        success: "bg-conservatory-100 text-conservatory-700 dark:bg-conservatory-800 dark:text-conservatory-100",
        warn: "bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
