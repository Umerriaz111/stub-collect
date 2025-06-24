import React, { useState } from 'react'
import { Popover, Box, Typography, Button, CircularProgress } from '@mui/material'
import { useDispatch } from 'react-redux'
import { LOGOUT } from '../../../core/store/auth/authSlice'
import { logoutApi } from '../../../core/api/auth'
import { handleError } from '../../../core/services/apiService'

export default function LogoutHandler({ children }) {
    const [anchorEl, setAnchorEl] = useState(null)
    const [logoutLoading, setLogoutLoading] = useState(false)
    const dispatch = useDispatch()

    const logoutPopoverOpen = Boolean(anchorEl)

    const handleLogoutPopoverOpen = event => {
        setAnchorEl(event.currentTarget)
    }

    const handleLogoutPopoverClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = async () => {
        setLogoutLoading(true)
        try {
            const response = await logoutApi()
            if (response?.status === 'success') {
                dispatch(LOGOUT())
            }
        } catch (error) {
            console.log('Error Occurred', error)
            handleError(error, 'Something went wrong')
        } finally {
            setLogoutLoading(false)
            handleLogoutPopoverClose()
        }
    }

    return (
        <>
            {/* Trigger button */}
            <span onClick={handleLogoutPopoverOpen}>{children}</span>

            {/* Logout Confirmation Popover */}
            <Popover
                open={logoutPopoverOpen}
                anchorEl={anchorEl}
                onClose={handleLogoutPopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                sx={{ my: 2 }}
            >
                <Box p={1}>
                    <Typography mb={1}>Are you sure to logout </Typography>
                    {logoutLoading ? (
                        <Button variant="contained" disabled fullWidth>
                            Logging Out <CircularProgress size={20} sx={{ ml: 2, color: 'gray' }} />
                        </Button>
                    ) : (
                        <>
                            <Button variant="outlined" size="small" sx={{ mx: 1 }} onClick={handleLogoutPopoverClose}>
                                No
                            </Button>
                            <Button data-testid="logout-confirm-button" variant="contained" color="error" size="small" onClick={handleLogout}>
                                Yes
                            </Button>
                        </>
                    )}
                </Box>
            </Popover>
        </>
    )
}
