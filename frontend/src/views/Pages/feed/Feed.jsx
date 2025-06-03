import { Typography } from '@mui/material'
import React from 'react'
import { useDispatch } from 'react-redux'
import { SET_HEADING } from '../../../core/store/App/appSlice'
import { useEffect } from 'react'

function Feed() {
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(SET_HEADING({ heading: 'Feed', subHeading: 'Feed Sub Heading' }))
    }, [])

    return (
        <>
            <Typography>Feed Body</Typography>
        </>
    )
}

export default Feed
