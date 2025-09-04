
import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';

const AuthLoadingScreen = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        background: 'transparent',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          textAlign: 'center',
          minWidth: 320,
          maxWidth: '90vw',
          backgroundColor: 'rgba(255, 255, 255, 0.24)', // Semi-transparent background
        }}
      >
        <Box sx={{ mb: 3 }}>
          <CircularProgress size={48} color="warning" />
        </Box>
        <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
          Checking Authentication...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait while we verify your login status
        </Typography>
      </Paper>
    </Box>
  );
};

export default AuthLoadingScreen;
