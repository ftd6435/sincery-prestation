import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'text' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const base =
'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors transition-shadow disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
  'bg-brand text-white shadow-glow hover:bg-brand-dark focus-visible:bg-brand-dark',
  secondary:
  'bg-white text-brand border border-brand hover:bg-[rgba(193,39,45,0.06)]',
  text: 'text-brand hover:text-brand-dark hover:underline',
  dark: 'bg-black text-white hover:bg-black/85'
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2.5',
  lg: 'text-base px-6 py-3'
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps &
ButtonHTMLAttributes<HTMLButtonElement> & {to?: undefined;};

type LinkProps = CommonProps & {to: string;href?: undefined;};

type AnchorProps = CommonProps &
AnchorHTMLAttributes<HTMLAnchorElement> & {href: string;};

export function Button(props: ButtonProps | LinkProps | AnchorProps) {
  const { variant = 'primary', size = 'md', className, children } = props;
  const classes = twMerge(
    base,
    variants[variant],
    variant === 'text' ? 'px-0 py-0 text-base' : sizes[size],
    className
  );

  if ('to' in props && props.to) {
    const { to } = props;
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>);

  }

  if ('href' in props && props.href) {
    const {
      href,
      variant: _v,
      size: _s,
      className: _c,
      children: _ch,
      ...rest
    } = props;
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>);

  }

  const {
    variant: _v,
    size: _s,
    className: _c,
    children: _ch,
    ...rest
  } = props as ButtonProps;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>);

}
