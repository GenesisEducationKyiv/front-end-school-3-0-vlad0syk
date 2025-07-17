import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

type ButtonVariant = 'text' | 'contained' | 'outlined';
type ButtonSize = 'small' | 'medium' | 'large';
type ButtonColor = 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';

export interface ButtonProps extends MuiButtonProps {
  /**
   * The variant to use.
   * @default 'contained'
   */
  variant?: ButtonVariant;
  /**
   * The size of the component.
   * @default 'medium'
   */
  size?: ButtonSize;
  /**
   * The color of the component.
   * @default 'primary'
   */
  color?: ButtonColor;
  /**
   * If `true`, the button will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * If `true`, the button will be disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * The content of the button.
   */
  children: React.ReactNode;
  /**
   * Callback fired when the button is clicked.
   */
  onClick?: () => void;
  /**
   * The URL to link to when the button is clicked. If provided, the button will be rendered as an anchor element.
   */
  href?: string;
  /**
   * The type of the button.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Element placed before the children.
   */
  startIcon?: React.ReactNode;
  /**
   * Element placed after the children.
   */
  endIcon?: React.ReactNode;
}

/**
 * Buttons allow users to take actions, and make choices, with a single tap.
 */
export const Button = ({
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  fullWidth = false,
  disabled = false,
  children,
  onClick,
  href,
  type = 'button',
  startIcon,
  endIcon,
  ...rest
}: ButtonProps) => {
  return (
    <MuiButton
      variant={variant}
      size={size}
      color={color}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      href={href}
      type={type}
      startIcon={startIcon}
      endIcon={endIcon}
      {...rest}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
