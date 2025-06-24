import { Switch, styled } from '@mui/material'

export const DefaultSwitch = styled(Switch)(({ theme }) => ({
    width: 46.4,
    height: 22.7,
    padding: 0,
    display: 'flex',
    borderRadius: 18.93,
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 17.9,
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(23px)',
        },
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        transition: theme.transitions.create(['all'], {
            duration: 700,
        }),
        '&.Mui-checked': {
            transform: 'translateX(23px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                opacity: 1,
                transition: theme.transitions.create(['width'], {
                    duration: 200,
                }),
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 17.9,
        height: 17.9,
        borderRadius: 11.87,
        transition: theme.transitions.create(['width'], {
            duration: 200,
        }),
    },
    '& .MuiSwitch-track': {
        borderRadius: 17.9 / 2,
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
        boxSizing: 'border-box',
        transition: theme.transitions.create(['background-color'], {
            duration: 700,
        }),
    },
}))

export const LabelSwitch = styled(Switch)(({ theme }) => ({
    width: 46.4,
    height: 22.7,
    padding: 0,
    display: 'flex',
    borderRadius: 18.93,
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 17.9,
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(23px)',
        },
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        transition: theme.transitions.create(['all'], {
            duration: 700,
        }),
        '&.Mui-checked': {
            transform: 'translateX(23px)',
            color: '#fff', // Keep the thumb white when checked
            '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: '#2B3674', // Blue for the track in checked state
            },
        },
        '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#2B3674', // Blue for the track when checked
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 17.9,
        height: 17.9,
        borderRadius: 11.87,
        transition: theme.transitions.create(['width'], {
            duration: 200,
        }),
        backgroundColor: '#fff', // Keep the thumb white in both states
    },
    '& .MuiSwitch-track': {
        borderRadius: 17.9 / 2,
        opacity: 1,
        backgroundColor: '#2B3674', // Blue color for the track in both checked and unchecked state
        boxSizing: 'border-box',
        transition: theme.transitions.create(['background-color'], {
            duration: 700,
        }),
    },
}))
