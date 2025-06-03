import { Typography } from '@mui/material'
import React from 'react'
import { useDispatch } from 'react-redux'
import { SET_HEADING } from '../../../core/store/App/appSlice'
import { useEffect } from 'react'

function Dashboard() {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(SET_HEADING({ heading: 'Main', subHeading: 'Dashboard' }))
    }, [])

    return (
        <>
            <Typography>Dashboard Body</Typography>
        </>
    )
}

export default Dashboard
