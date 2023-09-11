import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps<HTMLButtonElement> extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  block?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | 'text';
  outline?: boolean;

  size?: 'xs' | 'sm' | 'lg';
  className?: string;
  raised?: boolean;
  tag?: string;
  /**
   * material-design-style floating action button
   */
  fab?: boolean;
  id?: string;
}
