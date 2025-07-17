import React from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

type TextFieldVariant = 'outlined' | 'filled' | 'standard';
type TextFieldSize = 'small' | 'medium';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'variant' | 'size'> {
  variant?: TextFieldVariant;
  size?: TextFieldSize;
  label?: string;
  helperText?: string;
  placeholder?: string;
  value?: unknown;
  defaultValue?: unknown;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  type?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  multiline?: boolean;
  rows?: number | string;
  maxRows?: number | string;
  minRows?: number | string;
  isPassword?: boolean;
}

export const TextField = ({
  variant = 'outlined',
  size = 'medium',
  label,
  helperText,
  placeholder,
  value,
  defaultValue,
  onChange,
  disabled = false,
  error = false,
  fullWidth = false,
  required = false,
  type = 'text',
  startAdornment,
  endAdornment,
  multiline = false,
  rows,
  maxRows,
  minRows,
  isPassword = false,
  ...rest
}: TextFieldProps) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const endAdornmentWithPasswordToggle = isPassword ? (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={handleClickShowPassword}
        onMouseDown={handleMouseDownPassword}
        edge="end"
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  ) : endAdornment ? (
    <InputAdornment position="end">{endAdornment}</InputAdornment>
  ) : undefined;

  return (
    <MuiTextField
      variant={variant}
      size={size}
      label={label}
      helperText={helperText}
      placeholder={placeholder}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      disabled={disabled}
      error={error}
      fullWidth={fullWidth}
      required={required}
      type={inputType}
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment: endAdornmentWithPasswordToggle,
      }}
      multiline={multiline}
      rows={rows}
      maxRows={maxRows}
      minRows={minRows}
      {...rest}
    />
  );
};

export default TextField;
