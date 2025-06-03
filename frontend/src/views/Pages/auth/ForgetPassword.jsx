import React from 'react'
import { Grid, Typography, Button } from '@mui/material'
import FormField from '../../components/MUITextFiled/FormField'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import AuthPageRightSide from './AuthPageRightSide'

const ForgetPassword = () => {
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        onSubmit: async (values) => {
            console.log('values', values)
            navigate('/new-password') // TODO::This navigate has to me removed when api get ready
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
                        <Typography variant="h4">Continue with email</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body3" fontWeight={'500'}>
                            Email
                            <Typography component={'span'} sx={{ color: 'text.secondary' }}>
                                *
                            </Typography>
                        </Typography>
                        <FormField
                            sx={{ mt: '5px' }}
                            placeholder="john@example.com"
                            type={'email'}
                            id={'email'}
                            value={formik?.values?.email}
                            handleChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isTouched={formik.touched.email}
                            error={formik.errors?.email}
                        />
                    </Grid>
                    <Grid item xs={12} mb={1}>
                        <Typography variant="body3" color={'text.light'}>
                            An email with reset password link will sent to you
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
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

export default ForgetPassword
