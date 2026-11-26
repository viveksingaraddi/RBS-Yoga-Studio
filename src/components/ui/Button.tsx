import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  icon?: React.ReactNode;
  showArrow?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  target?: string;
  rel?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  icon,
  showArrow = false,
  fullWidth = false,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base classes with accessible focus ring and smooth hover
  const baseClasses =
    'inline-flex items-center justify-center font-semibold uppercase tracking-[0.18em] transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  // Size specifications
  const sizeClasses = {
    sm: 'text-[11px] px-4 py-2 space-x-1.5',
    md: 'text-xs px-6 py-3.5 space-x-2',
    lg: 'text-xs px-8 py-4 space-x-2.5',
  }[size];

  // Variant styling according to Phase 8 specifications
  const variantClasses = {
    primary:
      'bg-forest text-ivory hover:bg-forest-light shadow-sm hover:shadow-card focus-visible:ring-forest border border-transparent',
    secondary:
      'bg-transparent text-forest border border-forest/35 hover:bg-sage/40 hover:border-forest hover:text-forest-dark focus-visible:ring-forest',
    whatsapp:
      'bg-[#25D366] text-white hover:bg-[#1EBE5D] shadow-sm hover:shadow-md focus-visible:ring-[#25D366] border border-transparent',
    ghost:
      'bg-transparent text-forest hover:bg-forest/5 focus-visible:ring-forest border border-transparent',
  }[variant];

  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${
    fullWidth ? 'w-full' : ''
  } ${className}`;

  const content = (
    <>
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {showArrow && !isLoading && (
        <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  if (href) {
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return (
        <a href={href} className={`${combinedClasses} group`} target={props.target} rel={props.rel}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={`${combinedClasses} group`}>
        {content}
      </Link>
    );
  }

  return (
    <button className={`${combinedClasses} group`} disabled={disabled || isLoading} {...props}>
      {content}
    </button>
  );
}
