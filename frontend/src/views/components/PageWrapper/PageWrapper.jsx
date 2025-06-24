import React, { Suspense } from 'react'
import Box from '@mui/system/Box'
import ComponentLoader from '../Loaders/ComponentLoader'
import MainHeader from '../Headers/MainHeader'
const PageWrapper = ({ children, isSidebar }) => {
    return (
        <Box
            sx={{
                // height: isSidebar ? 'calc(100vh - 80px)' : '100%',
                height: isSidebar ? '100vh' : '100vh',
                overflow: 'auto',
                paddingTop: '1rem',
                paddingX: '10px',
                backgroundColor: 'primary.lightBG',
            }}
        >
            <Suspense fallback={<ComponentLoader />}>
                <MainHeader />
                <Box>{children}</Box>
            </Suspense>
        </Box>
    )
}

export default PageWrapper
