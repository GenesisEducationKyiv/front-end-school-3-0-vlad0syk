import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from '../components/TextField/TextField';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import { useState } from 'react';

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: ['outlined', 'filled', 'standard'],
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['small', 'medium'],
      },
    },
    color: {
      control: {
        type: 'select',
        options: ['primary', 'secondary', 'error', 'warning', 'success', 'info'],
      },
    },
    onChange: { action: 'changed' },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    helperText: 'Helper text',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    label: 'Outlined',
    placeholder: 'Outlined field',
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    label: 'Filled',
    placeholder: 'Filled field',
  },
};

export const Standard: Story = {
  args: {
    variant: 'standard',
    label: 'Standard',
    placeholder: 'Standard field',
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    label: 'Small',
    placeholder: 'Small field',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    label: 'Full Width',
    placeholder: 'This input takes full width',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'With Helper Text',
    helperText: 'This is a helper text',
  },
};

export const Error: Story = {
  args: {
    label: 'Error',
    error: true,
    helperText: 'This is an error message',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    value: 'Disabled value',
  },
};

export const WithIcons: Story = {
  args: {
    label: 'With Icons',
    startAdornment: '🔍',
    endAdornment: '✓',
  },
};

export const Password: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <TextField
        {...args}
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        isPassword
      />
    );
  },
  args: {
    label: 'Password',
    placeholder: 'Enter password',
  },
};

export const Multiline: Story = {
  args: {
    label: 'Multiline',
    multiline: true,
    rows: 4,
    placeholder: 'Enter multiple lines of text',
  },
};
