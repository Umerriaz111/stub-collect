import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

function ComponentLoader() {
    return (
        <Box
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // height: '100vh',
            }}
        >
            <CircularProgress
                sx={{
                    width: '250px',
                    height: '250px',
                    '& svg': {
                        strokeWidth: '24px',
                    },
                }}
            />
        </Box>
    )
}

export default ComponentLoader
