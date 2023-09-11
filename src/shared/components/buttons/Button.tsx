import React from 'react';
import classNames from 'classnames';
import { ButtonProps } from './index';

const Button = (props: ButtonProps<HTMLButtonElement>) => {
  const {
    active,
    block,
    className,
    color,
    disabled,
    outline,
    size,
    raised,
    fab,
    onClick,
    children,
    id,
    ...restProps
  } = props;

  const classes = classNames(
    'btn',
    `btn${outline ? '-outline' : ''}-${color}`,
    size ? `btn-${size}` : false,
    block ? 'btn-block' : false,
    raised ? 'btn-raised' : false,
    fab ? 'btn-fab' : false,
    active,
    disabled,
    className,
  );

  return (
    <button
      className={classes}
      id={id}
      type="button"
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
      {...restProps}
    >
      {children}
    </button>
  );
};

Button.defaultProps = {
  color: 'secondary',
  tag: 'button',
  children: 'button'
};

export default Button;
