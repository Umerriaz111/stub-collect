import Grid from '@mui/material/Grid';
import Box from '@mui/system/Box';
import React, { Suspense } from 'react';
import ComponentLoader from '../Loaders/ComponentLoader';
const AsideWrapper = ({ children }) => {
  return (
    <Grid
      item
      sm={2}
      // sx={{ width: '15.7vw' }}
    >
      <Box
        sx={{
          backgroundColor: 'white',
          height: 'calc(100vh - 72px)',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
        }}
      >
        <Suspense fallback={<ComponentLoader />}>{children}</Suspense>
      </Box>
    </Grid>
  );
};

export default AsideWrapper;
