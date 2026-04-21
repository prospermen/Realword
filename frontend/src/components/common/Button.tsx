import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

interface Props extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button({
  children,
  className = '',
  variant = 'secondary',
  size = 'md',
  ...props
}: Props) {
  const classes = `app-btn app-btn-${variant} app-btn-${size} ${className}`.trim();

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
}
