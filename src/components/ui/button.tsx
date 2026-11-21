import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Botões do Kambio (Identidade visual §9).
 * - principal: fundo marinho, texto branco, altura 52px, cantos 12px.
 * - secundario: fundo branco, borda, texto marinho.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-corpo font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        principal: "bg-principal text-white hover:bg-principal/90",
        secundario:
          "border border-linha bg-superficie text-principal hover:bg-fundo",
        destaque: "bg-destaque text-white hover:bg-destaque/90",
      },
      size: {
        default: "h-[52px] px-5",
        sm: "h-11 px-4 text-legenda",
        icone: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "principal",
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
