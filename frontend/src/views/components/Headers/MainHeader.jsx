import { Button, Grid, IconButton, Paper, Typography, useMediaQuery, Tooltip } from '@mui/material'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Box, Stack } from '@mui/system'
import { useSelector } from 'react-redux'
import { ArrowBackIos } from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { TOGGLE_SIDEBAR } from '../../../core/store/App/appSlice'
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated'
import { Menu as MenuIcon } from '@mui/icons-material'
import ProfileMenu from './ProfileMenu'

export default function MainHeader() {
    const { heading, subHeading, backButton } = useSelector((state) => state.app)
    const location = useLocation()
    // const isSubPage = location.pathname.split('/').length > 2
    const dispatch = useDispatch()
    // console.log('location.pathname', location.pathname.split('/').length > 2)
    const handleToggle = () => {
        dispatch(TOGGLE_SIDEBAR())
    }
    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('md'))

    // const handleThemeToggle = () => {
    //     dispatch(TOGGLE_THEME())
    // }

    return (
        <Grid container spacing={2} display={'flex'} alignItems={'center'}>
            {/* First Column for desktop, but it will be rendered second on mobile */}
            <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                <Typography
                    color={'palette.text.secondary'}
                    sx={{ textTransform: 'capitalize', fontWeight: 500, fontSize: '20px' }}
                    display={'flex'}
                    alignItems={'end'}
                >
                    {heading}
                    {/* {heading || location.pathname === '/' ? 'Main' : location.pathname.split('/')} */}
                </Typography>
                <Typography
                    sx={{
                        fontWeight: 700,
                        fontSize: '34px',
                        lineHeight: '42px',
                    }}
                >
                    {subHeading}
                </Typography>
                {backButton && (
                    <Button sx={{ color: 'text.light' }} onClick={() => history.back()}>
                        <ArrowBackIos sx={{ fontSize: '12px' }} /> Back
                    </Button>
                )}
            </Grid>

            {/* Second Column for desktop, but it will appear first on mobile */}
            <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }} display={isSmallScreen ? 'block' : 'flex'} justifyContent={'end'}>
                <Paper sx={{ display: 'flex', justifyContent: 'space-between', borderRadius: '30px', padding: '5px 0px' }}>
                    {/* <Stack direction={'row'} alignItems={'center'}> */}
                    <Box>
                        {isSmallScreen && (
                            <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleToggle} sx={{ ml: '10px' }}>
                                <MenuIcon />
                            </IconButton>
                        )}
                    </Box>
                    <Box>
                        <ProfileMenu />
                    </Box>
                    {/* </Stack> */}
                </Paper>
            </Grid>
        </Grid>
    )
}
const IconBtnStyle = {
    padding: '0',
    marginX: '12px',
}
