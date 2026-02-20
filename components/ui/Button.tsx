import * as React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  outline: "btn--outline",
  ghost: "btn--ghost",
  destructive: "btn--destructive",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "btn--sm",
  md: "btn--md",
  lg: "btn--lg",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = [
    "btn",
    variantClass[variant],
    sizeClass[size],
    fullWidth && "btn--full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} type={props.type ?? "button"} className={classes}>
      {children}
    </button>
  );
}
