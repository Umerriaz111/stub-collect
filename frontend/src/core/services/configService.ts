interface ConfigData {
    VITE_APP_API_BASE_URL: string
    VITE_APP_AUTH_API_BASE_URL?: string
    VITE_APP_VERSION: string
    PROJECT_NAME: string
    VITE_APP_ENVIRONMENT: string
    VITE_APP_LABEL_API_URL: string
    VITE_APP_ALLOWED_USER: string
    VITE_APP_AMAZON_APPLICATION_ID: string
    VITE_APP_REDIRECT_URI: string
}

interface Config extends ConfigData {
    _configPromise: Promise<ConfigData> | null
    loadConfig(): Promise<ConfigData>
}

const config: Config = {
    _configPromise: null,
    VITE_APP_API_BASE_URL: '',
    VITE_APP_AUTH_API_BASE_URL: '',
    VITE_APP_VERSION: '',
    PROJECT_NAME: '',
    VITE_APP_ENVIRONMENT: '',
    VITE_APP_LABEL_API_URL: '',
    VITE_APP_ALLOWED_USER: '',
    VITE_APP_AMAZON_APPLICATION_ID: '',
    VITE_APP_REDIRECT_URI: '',

    loadConfig(): Promise<ConfigData> {
        if (!this._configPromise) {
            this._configPromise = fetch('/config.json')
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch config')
                    }
                    return response.json() as Promise<ConfigData>
                })
                .then((data) => {
                    Object.assign(this, data) // Assign fetched config data to the config object
                    return data
                })
                .catch((err) => {
                    console.error(err)
                    throw err
                })
        }
        return this._configPromise
    },
}

export default config
