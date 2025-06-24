import services from './core/services/initServices'
import { useDispatch } from 'react-redux'
import { LOGOUT } from './core/store/auth/authSlice'

function AppWrapper({ children }) {
    const dispatch = useDispatch()
    const logout = () => {
        dispatch({ type: LOGOUT })
    }
    services.init(logout) //initialize all services

    return children
}

export default AppWrapper
