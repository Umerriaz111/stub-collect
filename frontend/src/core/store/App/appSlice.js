import { createSlice } from '@reduxjs/toolkit'

const getTheme = () => {
    return localStorage.getItem('themeMode')
}
const currentTheme = getTheme()

const switchTheme = () => {
    const theme = getTheme()
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('themeMode', newTheme)
}

export const appSlice = createSlice({
    name: 'app',
    initialState: {
        heading: '',
        subHeading: '',
        backButton: false,
        isSidebarOpen: false,
        themeMode: currentTheme === 'dark' ? currentTheme : 'light', // Add themeMode to the state
    },
    reducers: {
        SET_HEADING: (state, action) => {
            state.heading = action.payload.heading
            state.subHeading = action.payload.subHeading
            state.backButton = action.payload.backButton
        },
        TOGGLE_SIDEBAR: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen
        },
        TOGGLE_THEME: (state) => {
            state.themeMode = state.themeMode === 'light' ? 'dark' : 'light' // Toggle theme mode
            switchTheme()
        },
        SET_THEME_LIGHT: (state) => {
            state.themeMode = 'light'
            localStorage.setItem('themeMode', 'light')
        },
    },
})

export const { SET_HEADING, TOGGLE_SIDEBAR, TOGGLE_THEME, SET_THEME_LIGHT } = appSlice.actions

export default appSlice.reducer
