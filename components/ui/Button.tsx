import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "ghost";

type Comum = { variant?: Variante; block?: boolean };

const classes = (variant: Variante, block?: boolean, extra?: string) =>
  ["btn", variant !== "primary" && `btn--${variant}`, block && "btn--block", extra].filter(Boolean).join(" ");

type ButtonProps = Comum & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export function Button({ variant = "primary", block, loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={classes(variant, block, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

type ButtonLinkProps = Comum & AnchorHTMLAttributes<HTMLAnchorElement>;

export function ButtonLink({ variant = "primary", block, className, ...rest }: ButtonLinkProps) {
  return <a className={classes(variant, block, className)} {...rest} />;
}
