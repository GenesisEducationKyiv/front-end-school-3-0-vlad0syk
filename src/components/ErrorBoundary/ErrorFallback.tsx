import { Button, Typography, Box } from '@mui/material';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="100vh"
    p={3}
    textAlign="center"
  >
    <Typography variant="h4" color="error" gutterBottom>
      Something went wrong
    </Typography>
    <Typography variant="body1" color="textSecondary" paragraph>
      {error.message}
    </Typography>
    <Button
      variant="contained"
      color="primary"
      onClick={resetErrorBoundary}
      sx={{ mt: 2 }}
    >
      Try again
    </Button>
  </Box>
);
