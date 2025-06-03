import ApiService from '../services/apiService'
import config from '../services/configService'
import axios from 'axios'

export const registerUserApi = async (registerData: any) => {
    return ApiService.post('/auth/register', registerData)
}

// export const loginApi = async (loginData: any) => {
//     return axios.post(`${config.VITE_APP_AUTH_API_BASE_URL}/auth/login`, loginData)
// }

export const logoutApi = () => {
    return new Promise((resolve, reject) => {
        resolve({ status: 'success', message: 'logout successful' })
        reject({})
    })
}

// TODO:: Remove all below code after integration and uncomment the above loginAPi Function
const dummySuccessfulLoginResponse = {
    data: {
        accessToken: 'eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9-staticToken',
        name: 'test user',
        username: 'testuser',
        role: 'tester',
    },
}

const invalidCredentials = {
    response: {
        data: {
            message: 'invalid credentials',
        },
    },
}

export const loginApi = (loginData: any) => {
    if (config?.VITE_APP_AUTH_API_BASE_URL) {
        return axios.post(`${config.VITE_APP_AUTH_API_BASE_URL}/auth/login`, loginData)
        // TODO:: we will have to remove this checker from it after the api start working
    } else {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (loginData?.username === 'admin@admin.com' && loginData?.password === 'password') {
                    resolve(dummySuccessfulLoginResponse)
                } else {
                    reject(invalidCredentials)
                }
            }, 1000)
        })
    }
}


// The function to request a new access token using the refresh token
export const refreshTokenAPI = (refreshToken: string): any => {
    const data = {
        refreshToken: refreshToken, // Sending the refresh token to the backend
    }

    // Make an API request to your backend to get a new access token
    return axios.post(`${config.VITE_APP_AUTH_API_BASE_URL}/auth/refresh`, data)
}
