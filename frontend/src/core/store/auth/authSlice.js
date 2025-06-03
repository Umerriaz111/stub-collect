import { createSlice } from '@reduxjs/toolkit'

import {
    checkUser,
    destroyToken,
    getToken,
    getUser,
    saveToken,
    getUsernameFromLocalStorage,
    saveUser,
    saveRefreshToken,
    destroyRefreshToken,
} from '../../services/authService'

import ApiService from '../../services/apiService'
import { getPrintingPreference, savePrintingPreference } from '../../services/authService'

const token = getToken()
token && ApiService.setAuthToken(token)

const initialState = {
    user: getUser(),
    isAuthenticated: token ? true : false,
    tokenExpired: false,
    printByNativeApp: getPrintingPreference(),
    isUserSJComputers: getUsernameFromLocalStorage(),
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        LOGIN: (state, action) => {
            state.isAuthenticated = true
            state.user = action.payload.name
            saveUser(action.payload?.name)
            ApiService.setAuthToken(action.payload?.accessToken)
            saveToken(action.payload?.accessToken)

            const isUserSJComputers = checkUser(action.payload?.accessToken)
            state.isUserSJComputers = isUserSJComputers
            saveRefreshToken(action.payload?.refreshToken)

            // If not a valid SJComputers user, set printing preference
            if (!isUserSJComputers) {
                state.printByNativeApp = true
                savePrintingPreference(true)
            }
        },
        LOGOUT: (state) => {
            state.isAuthenticated = false
            state.user = null
            state.isUserSJComputers = false
            state.printByNativeApp = false
            savePrintingPreference(false)
            saveUser(null)
            ApiService.setHeader('Authorization', '')
            destroyToken()
            destroyRefreshToken()
        },
        REGISTER: (state, action) => {
            state.isLoading = false
            state.apiError = null
            state.user = action.payload
        },
        SET_TOKEN_EXPIRED: (state, action) => {
            state.tokenExpired = action.payload
        },
        SET_PRINTING_PREFERENCE: (state, action) => {
            state.printByNativeApp = action.payload
            savePrintingPreference(action.payload) // Save updated preference to localStorage
        },
    },
})
export const { LOGIN, LOGOUT, REGISTER, SET_TOKEN_EXPIRED, SET_PRINTING_PREFERENCE } = authSlice.actions
export default authSlice.reducer
