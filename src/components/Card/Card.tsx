import React from 'react';
import {
  Card as MuiCard,
  CardHeader,
  CardHeaderProps,
  CardContent,
  CardContentProps,
  CardActions,
  CardActionsProps,
  CardMedia,
  Typography,
  CardProps as MuiCardProps,
  SxProps,
  Theme,
} from '@mui/material';

// Define our own CardProps that extends the MUI CardProps
type CardBaseProps = Omit<MuiCardProps, 'title' | 'children'>;

interface CardProps extends CardBaseProps {
  /**
   * The title of the card.
   */
  title?: React.ReactNode;
  
  /**
   * The subheader of the card.
   */
  subheader?: React.ReactNode;
  
  /**
   * The content of the card.
   */
  children?: React.ReactNode;
  
  /**
   * The actions to display at the bottom of the card.
   */
  actions?: React.ReactNode;
  
  /**
   * The image URL to display at the top of the card.
   */
  image?: string;
  
  /**
   * The alt text for the card image.
   */
  imageAlt?: string;
  
  /**
   * The height of the card image.
   */
  imageHeight?: number | string;
  
  /**
   * Props to pass to the CardHeader component.
   */
  headerProps?: CardHeaderProps;
  
  /**
   * Props to pass to the CardContent component.
   */
  contentProps?: CardContentProps;
  
  /**
   * Props to pass to the CardActions component.
   */
  actionsProps?: CardActionsProps;
  
  /**
   * Props to pass to the CardMedia component.
   */
  mediaProps?: Omit<React.ComponentProps<typeof CardMedia>, 'component' | 'image' | 'alt' | 'ref'>;
  
  /**
   * Custom styles
   */
  sx?: SxProps<Theme>;
}

/**
 * A customizable Card component based on Material-UI's Card.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  title,
  subheader,
  children,
  actions,
  image,
  imageAlt = '',
  imageHeight = 140,
  headerProps,
  contentProps,
  actionsProps,
  mediaProps,
  ...rest
}, ref) => {
  return (
    <MuiCard ref={ref} sx={{ maxWidth: 345, m: 2 }} {...rest}>
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={imageAlt}
          {...mediaProps}
        />
      )}
      
      {(title || subheader) && (
        <CardHeader title={title} subheader={subheader} {...headerProps} />
      )}
      
      {(children) && (
        <CardContent {...contentProps}>
          {children}
        </CardContent>
      )}
      
      {actions && (
        <CardActions {...actionsProps}>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
});

/**
 * A simple card with a title and content.
 */
const SimpleCard: React.FC<{ 
  title: string; 
  content: string | React.ReactNode;
  sx?: SxProps<Theme>;
}> = ({ title, content, sx }) => (
  <Card sx={sx}>
    <CardContent>
      <Typography variant="h6" component="div">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {content}
      </Typography>
    </CardContent>
  </Card>
);

/**
 * A card with an image, title, and content.
 */
const MediaCard: React.FC<{
  image: string;
  imageAlt: string;
  title: string;
  content: string | React.ReactNode;
  actions?: React.ReactNode;
  sx?: SxProps<Theme>;
}> = ({ image, imageAlt, title, content, actions, sx }) => (
  <Card image={image} imageAlt={imageAlt} sx={sx}>
    <CardContent>
      <Typography gutterBottom variant="h5" component="div">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {content}
      </Typography>
    </CardContent>
    {actions && <CardActions>{actions}</CardActions>}
  </Card>
);

export { Card, SimpleCard, MediaCard };
export default Card;
