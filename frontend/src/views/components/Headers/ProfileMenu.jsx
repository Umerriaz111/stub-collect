import React, { useState } from 'react'
import { Avatar, IconButton, Menu, MenuItem, Divider, Typography, Box } from '@mui/material'
import { Logout, AccountCircleRounded } from '@mui/icons-material'
import CustomizedSwitches from './Switch'
import LogoutHandler from './LogoutHandler'
import { TOGGLE_THEME } from '../../../core/store/App/appSlice'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated'

export default function ProfileMenu() {
    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch()

    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)

    const themeMode = useSelector((state) => state?.app?.themeMode)
    const [isSwitchOn, setIsSwitchOn] = React.useState(themeMode === 'dark' ? true : false)

    const handleSwitchChange = (event) => {
        setIsSwitchOn(event.target.checked)
    }
    const handleMenuItemClick = (event) => {
        setIsSwitchOn(!isSwitchOn)
        dispatch(TOGGLE_THEME())
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleDownloadClick = () => {
        window.open(
            'https://ninetyninetechnologies-my.sharepoint.com/:u:/g/personal/muhammad_ahmed_99technologies_com/EVujmvHYCExMq_uMd8gzqpEBfsQrZkb-tGuVz_QXewCzCw?e=Ahw7hM',
            '_blank',
            'noopener,noreferrer',
        )
    }

    return (
        <>
            <IconButton
                data-testid="profile-menu-btn"
                onClick={handleClick}
                size="small"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{ padding: '0', marginX: '12px', backgroundColor: user ? 'primary.lightIcon' : '', borderRadius: '8px', px: 1, my: '5px' }}
            >
                {user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountCircleRounded />
                        <Typography fontSize={'12px'} fontWeight={700} p={'4px'}>
                            {user}
                        </Typography>
                    </Box>
                ) : (
                    <Avatar alt="login-user" src="Avatar.png" sx={{ width: 40, height: 40 }} />
                )}
            </IconButton>

            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingY: '12px' }}
                    onClick={handleDownloadClick}
                >
                    Download Print App
                    <BrowserUpdatedIcon sx={{ padding: '0', marginX: '12px', color: 'primary.lightIcon' }} />
                </MenuItem>

                <MenuItem onClick={handleMenuItemClick}>
                    {isSwitchOn ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    <CustomizedSwitches checked={isSwitchOn} handleChange={handleSwitchChange} />
                </MenuItem>

                <Divider />

                <LogoutHandler>
                    <MenuItem data-testid="logout-btn" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Logout
                        <IconButton>
                            <Logout sx={{ color: 'primary.lightIcon', fontSize: 24 }} />
                        </IconButton>
                    </MenuItem>
                </LogoutHandler>
            </Menu>
        </>
    )
}
const IconBtnStyle = {
    padding: '0',
    marginX: '12px',
}
