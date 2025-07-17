import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@mui/material/styles';
import { Card, SimpleCard, MediaCard } from '../components/Card/Card';
import { theme } from '../theme/theme';
import { Button, Typography } from '@mui/material';


const meta = {
  title: 'Components/Card',
  component: Card,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <div style={{ padding: '1rem' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: { type: 'number', min: 0, max: 24, step: 1 },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  render: (args) => (
    <Card {...args}>
      <Typography variant="h5" component="div">
        Basic Card
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This is a basic card with some content inside.
      </Typography>
      <Button size="small">Learn More</Button>
    </Card>
  ),
};

export const WithHeader: Story = {
  args: {
    title: "Card with Header",
    subheader: "September 14, 2023",
  },
  render: (args) => (
    <Card {...args}>
      <Typography variant="body2" color="text.secondary">
        This card has a header with a title and subheader.
      </Typography>
    </Card>
  ),
};

export const WithImage: Story = {
  args: {
    image: "https://source.unsplash.com/random/400x200",
    imageAlt: "Random image",
    title: "Card with Image",
  },
  render: (args) => (
    <Card {...args}>
      <Typography variant="body2" color="text.secondary">
        This card has an image at the top.
      </Typography>
    </Card>
  ),
};

export const WithActions: Story = {
  args: {
    title: "Card with Actions",
    actions: (
      <>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </>
    ),
  },
  render: (args) => (
    <Card {...args}>
      <Typography variant="body2" color="text.secondary">
        This card has action buttons at the bottom.
      </Typography>
    </Card>
  ),
};

export const OutlinedVariant: Story = {
  args: {
    variant: 'outlined',
  },
  render: (args) => (
    <Card {...args}>
      <Typography variant="h5" component="div">
        Outlined Card
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This card uses the outlined variant.
      </Typography>
    </Card>
  ),
};


export const SimpleCardExample: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <SimpleCard 
        title="Simple Card" 
        content="This is a simple card with just a title and content." 
      />
      <SimpleCard 
        title="Custom Styled" 
        content="This simple card has custom styling."
        sx={{ 
          backgroundColor: 'primary.light',
          color: 'primary.contrastText',
          '& .MuiTypography-root': {
            color: 'primary.contrastText',
          },
        }}
      />
    </div>
  ),
};


export const MediaCardExample: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <MediaCard
        image="https://source.unsplash.com/random/600x400?nature"
        imageAlt="Nature"
        title="Nature"
        content="This is a media card with an image of nature."
        actions={
          <Button size="small" color="primary">
            View
          </Button>
        }
      />
      <MediaCard
        image="https://source.unsplash.com/random/600x400?architecture"
        imageAlt="Architecture"
        title="Architecture"
        content="This is a media card with an image of architecture."
        actions={
          <Button size="small" color="primary">
            View
          </Button>
        }
      />
    </div>
  ),
};

export const Elevation: Story = {
  render: () => (
    <>
      <Card elevation={1} sx={{ m: 2, p: 2 }}>
        <Typography>Elevation 1</Typography>
      </Card>
      <Card elevation={3} sx={{ m: 2, p: 2 }}>
        <Typography>Elevation 3</Typography>
      </Card>
      <Card elevation={6} sx={{ m: 2, p: 2 }}>
        <Typography>Elevation 6</Typography>
      </Card>
      <Card elevation={12} sx={{ m: 2, p: 2 }}>
        <Typography>Elevation 12</Typography>
      </Card>
    </>
  ),
};
