"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary CTA — reserved for the one action per screen that matters most.
        primary:
          "bg-brown-dark text-cream-light hover:bg-brown-main active:bg-brown-soft",
        // Accent — the one place --color-green-main is allowed to be a button fill.
        accent:
          "bg-green-main text-cream-light hover:opacity-90 active:opacity-80",
        outline:
          "border border-beige-main bg-transparent text-brown-dark hover:bg-cream-muted",
        ghost: "text-brown-dark hover:bg-cream-muted",
        link: "text-brown-dark underline-offset-4 hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// Note: never pass `asChild` together with a custom `onClick` that assumes a
// <button> element underneath — with asChild, Slot forwards props to
// whatever single child element you render instead (e.g. a Next.js <Link>).
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
