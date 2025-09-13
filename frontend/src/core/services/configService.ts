interface ConfigData {
    VITE_APP_API_BASE_URL: string
}

interface Config extends ConfigData {
    _configPromise: Promise<ConfigData> | null
    loadConfig(): Promise<ConfigData>
}

const config: Config = {
    VITE_APP_API_BASE_URL: '',
    _configPromise: null,

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
