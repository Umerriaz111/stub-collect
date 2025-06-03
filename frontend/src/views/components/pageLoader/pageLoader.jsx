import { Box, CircularProgress, Typography, Container, Fade } from '@mui/material';
import { keyframes } from '@mui/system';

const bounceAnimation = keyframes`
  0%, 80%, 100% { 
    transform: scale(0);
  }
  40% { 
    transform: scale(1.0);
  }
`;

const PageLoader = ({ text }) => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
          py: 4,
        }}
      >
        <Fade in={true} timeout={1000}>
          <Box sx={{ position: 'relative', mb: 4 }}>
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: 'primary.main',
                animation: 'spin 2s linear infinite',
              }}
            />
            <CircularProgress
              size={60}
              thickness={4}
              sx={{
                color: 'secondary.main',
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: '-30px',
                marginTop: '-30px',
                animation: 'spin 1.5s linear infinite reverse',
              }}
            />
            <CircularProgress
              size={40}
              thickness={4}
              sx={{
                color: 'info.main',
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: '-20px',
                marginTop: '-20px',
                animation: 'spin 1s linear infinite',
              }}
            />
          </Box>
        </Fade>

        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'text.primary',
            mb: 2,
            animation: 'pulse 2s infinite',
          }}
        >
          {text}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                animation: `${bounceAnimation} 1.4s infinite ease-in-out both`,
                animationDelay: `${index * 0.16}s`,
              }}
            />
          ))}
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          Please wait while we finish up...
        </Typography>
      </Box>
    </Container>
  );
};

export default PageLoader;
  