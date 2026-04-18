import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outlineLight"
  | "accentGreen"
  | "accentOrange";

export type ButtonSize = "default" | "lg" | "compact";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-950/25 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
  secondary:
    "bg-white text-slate-900 ring-1 ring-slate-200 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
  ghost:
    "text-slate-700 ring-1 ring-transparent hover:bg-slate-100 hover:ring-slate-200/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
  outlineLight:
    "border border-white/75 bg-white/10 text-white shadow-sm ring-1 ring-white/20 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
  accentGreen:
    "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-950/25 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600",
  accentOrange:
    "bg-orange-500 text-white shadow-sm ring-1 ring-orange-950/20 hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
  compact: "px-3 py-2 text-xs",
};

const baseLayout =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50";

/** Use on elements that should match `<Button>` (e.g. a label inside another `button`). */
export function buttonSurfaceClasses(options: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  const { variant = "primary", size = "default", className = "" } = options;
  return `${baseLayout} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim();
}

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonAsButton = BaseProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

type ButtonAsLink = BaseProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  if ("href" in props && props.href) {
    const { href, children, className = "", variant = "primary", size = "default", ...rest } =
      props as ButtonAsLink;
    const classes = buttonSurfaceClasses({ variant, size, className });
    return (
      <Link className={classes} href={href} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    type = "button",
    children,
    className = "",
    variant = "primary",
    size = "default",
    ...rest
  } = props as ButtonAsButton;
  const classes = buttonSurfaceClasses({ variant, size, className });
  return (
    <button className={classes} type={type} {...rest}>
      {children}
    </button>
  );
}
