import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = '', ...props }: Props) {
  const classes = `app-input ${className}`.trim();

  return (
    <input
      {...props}
      className={classes}
    />
  );
}
