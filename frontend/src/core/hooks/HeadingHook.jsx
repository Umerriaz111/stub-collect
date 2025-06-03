import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { SET_HEADING } from '../store/App/appSlice'

/**
 * Custom Hook to set the page heading.
 *
 * @param {Object} options Contains heading, subHeading
 */
function usePageHeading({ heading, subHeading, backButton }) {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(SET_HEADING({ heading, subHeading, backButton }))
    }, [dispatch, heading, subHeading]) // Adding dependencies to useEffect for completeness
}

export default usePageHeading
