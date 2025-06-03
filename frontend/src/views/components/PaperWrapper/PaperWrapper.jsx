import { Paper } from '@mui/material'
import React from 'react'

function PaperWrapper({ children, sx = {} }) {
    return <Paper sx={{ padding: '16px', marginTop: 2, borderRadius: '32px', ...sx }}>{children}</Paper>
}

export default PaperWrapper
