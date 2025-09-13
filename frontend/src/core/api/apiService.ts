// frontend/src/core/services/apiService.ts
import axios, { AxiosInstance } from "axios";
import config from "../services/configService";

let apiInstance: AxiosInstance | null = null;

export async function getApi(): Promise<AxiosInstance> {
    if (!apiInstance) {
        const cfg = await config.loadConfig();
        apiInstance = axios.create({
            baseURL: cfg.VITE_APP_API_BASE_URL,
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    return apiInstance;
}