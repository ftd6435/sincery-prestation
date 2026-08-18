import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type Variant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'ghost'
  | 'text'
  | 'dark';

type Size = 'sm' | 'md' | 'lg';

const base =
  'group inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors transition-shadow focus:outline-none disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white shadow-glow hover:bg-brand-dark focus-visible:bg-brand-dark focus-visible:ring-2 focus-visible:ring-brand/30',
  secondary:
    'bg-white text-brand border border-brand hover:bg-[rgba(193,39,45,0.06)] focus-visible:ring-2 focus-visible:ring-brand/30',
  danger:
    'bg-danger text-white hover:bg-danger/90 focus-visible:ring-2 focus-visible:ring-danger/30 shadow-sm',
  warning:
    'bg-warning text-white hover:bg-warning/90 focus-visible:ring-2 focus-visible:ring-warning/30 shadow-sm',
  success:
    'bg-success text-white hover:bg-success/90 focus-visible:ring-2 focus-visible:ring-success/30 shadow-sm',
  ghost:
    'bg-transparent text-black/75 hover:bg-surface-alt hover:text-black/95 focus-visible:bg-surface-alt',
  text: 'text-brand hover:text-brand-dark hover:underline px-0 py-0 text-base shadow-none',
  dark:
    'bg-black text-white hover:bg-black/85 focus-visible:ring-2 focus-visible:ring-black/30',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2.5',
  lg: 'text-base px-6 py-3',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };

type LinkProps = CommonProps & { to: string; href?: undefined } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'onClick'
>;

type AnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

function InnerContent({
  loading,
  iconLeft,
  iconRight,
  children,
}: Pick<CommonProps, 'loading' | 'iconLeft' | 'iconRight' | 'children'>) {
  return (
    <>
      {loading ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : iconLeft}
      {children}
      {!loading && iconRight}
    </>
  );
}

export function Button(props: ButtonProps | LinkProps | AnchorProps) {
  const {
    variant = 'primary',
    size = 'md',
    className,
    children,
    loading = false,
    iconLeft,
    iconRight,
  } = props;

  const classes = twMerge(
    base,
    variants[variant],
    variant === 'text' ? sizes.md : sizes[size],
    loading && 'cursor-progress',
    className,
  );

  if ('to' in props && props.to) {
    return (
      <Link to={(props as LinkProps).to} className={classes} aria-disabled={loading || undefined}>
        <InnerContent
          loading={loading}
          iconLeft={iconLeft}
          iconRight={iconRight}
          children={children}
        />
      </Link>
    );
  }

  if ('href' in props && props.href) {
    const { href, ...rest } = props as AnchorProps;
    return (
      <a href={href} className={classes} aria-disabled={loading || undefined} {...rest}>
        <InnerContent
          loading={loading}
          iconLeft={iconLeft}
          iconRight={iconRight}
          children={children}
        />
      </a>
    );
  }

  const { ...rest } = props as ButtonProps;
  return (
    <button
      className={classes}
      disabled={rest.disabled || loading || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      <InnerContent
        loading={loading}
        iconLeft={iconLeft}
        iconRight={iconRight}
        children={children}
      />
    </button>
  );
}
