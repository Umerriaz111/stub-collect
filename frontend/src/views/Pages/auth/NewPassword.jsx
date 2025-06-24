import React, { useState } from 'react'
import { Grid, Typography, Button, InputAdornment, IconButton } from '@mui/material'
import FormField from '../../components/MUITextFiled/FormField'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AuthPageRightSide from './AuthPageRightSide'

const NewPassword = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword)
    }

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prevShowPassword) => !prevShowPassword)
    }

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        // validationSchema: validationSchema,
        // validateOnChange: false,
        onSubmit: async (values) => {
            console.log('values', values)
        },
    })

    return (
        <Grid container minHeight={'100vh'} direction={'row-reverse'}>
            {/* right grid item */}
            <AuthPageRightSide /> {/* :: This component is grid item */}
            {/* left grid item */}
            <Grid item xs={12} sm={6} container sx={{ display: 'flex', alignItems: 'start', justifyContent: 'center' }} pt={'15vh'}>
                <Grid item xs={10} md={7} component={'form'} onSubmit={formik.handleSubmit} container rowGap={2} py={3}>
                    <Grid item xs={12}>
                        <Typography variant="h4">Enter your new password</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body3" fontWeight={'500'}>
                            New Password
                            <Typography component={'span'} sx={{ color: 'text.secondary' }}>
                                *
                            </Typography>
                        </Typography>
                        <FormField
                            sx={{ mt: '5px' }}
                            placeholder="Min, 8 characters"
                            id={'password'}
                            type={showPassword ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleTogglePasswordVisibility} edge="end">
                                            {showPassword ? <VisibilityOffIcon fontSize="12px" /> : <VisibilityIcon fontSize="12px" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            value={formik?.values?.password}
                            handleChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isTouched={formik.touched.password}
                            error={formik.errors?.password}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body3" fontWeight={'500'}>
                            Re-type Password
                            <Typography component={'span'} sx={{ color: 'text.secondary' }}>
                                *
                            </Typography>
                        </Typography>
                        <FormField
                            sx={{ mt: '5px' }}
                            placeholder="Min, 8 characters"
                            id={'confirmPassword'}
                            type={showConfirmPassword ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={handleToggleConfirmPasswordVisibility} edge="end">
                                            {showConfirmPassword ? <VisibilityOffIcon fontSize="12px" /> : <VisibilityIcon fontSize="12px" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            value={formik?.values?.confirmPassword}
                            handleChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isTouched={formik.touched.confirmPassword}
                            error={formik.errors?.confirmPassword}
                        />
                    </Grid>
                    <Grid item xs={12} mt={2}>
                        <Button variant="contained" type="submit" fullWidth sx={{ borderRadius: '16px', py: 2 }}>
                            <Typography variant="body3">CONTINUE</Typography>
                        </Button>
                    </Grid>
                    <Grid item xs={12} display={'flex'}>
                        <Typography
                            variant="body3"
                            fontWeight={500}
                            component={Link}
                            to={'/login'}
                            px={'2px'}
                            sx={{ textDecoration: 'none' }}
                            color={'text.secondary'}
                        >
                            Sign in instaed
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default NewPassword
