/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  isCancel,
} from "axios";
import {
  checkExpiry,
  getToken,
  saveToken,
  getRefreshToken,
  saveRefreshToken,
} from "./authService";
import notyf from "../../views/components/NotificationMessage/notyfInstance";
import configService from "./configService";
// @ts-expect-error - Store is dynamically imported
import { store } from "../store/store";
// @ts-expect-error - Action is dynamically imported
import { SET_TOKEN_EXPIRED } from "../store/auth/authSlice";

/**
 * Service to call HTTP request via Axios
 */

interface ApiService {
  instance: AxiosInstance | null;
  logout: (() => void) | null;
  init(logout: () => void): void;
  setHeader(header: string, val: string): void;
  setAuthToken(token?: string | null): void;
  setDefaultBaseUrl(url?: string): void;
  isRateLimited(): boolean;
  setRateLimit(): void;
  resetRateLimit(): void;
  get(
    resource: string,
    slug?: string,
    params?: any,
    baseURL?: string
  ): Promise<any>;
  getWithAbort(
    resource: string,
    slug?: string,
    params?: any,
    baseURL?: string
  ): [Promise<any>, AbortController];
  post(
    resource: string,
    params?: any,
    slug?: string,
    isFormData?: boolean,
    baseURL?: string
  ): Promise<any>;
  patch(
    resource: string,
    params?: any,
    slug?: string,
    isFormData?: boolean,
    baseURL?: string
  ): Promise<any>;
  patchWithAbort(
    resource: string,
    params?: any,
    slug?: string,
    isFormData?: boolean,
    baseURL?: string
  ): [Promise<any>, AbortController];
  put(
    resource: string,
    slug?: string,
    params?: any,
    isFormData?: boolean,
    baseURL?: string
  ): Promise<any>;
  delete(
    resource: string,
    slug?: string,
    params?: any,
    isFormData?: boolean,
    baseURL?: string
  ): Promise<any>;
}

const ACCEPTED_ERROR_CODES = [400, 401, 403, 422];
let isRateLimited = false;
let rateLimitTimestamp = 0;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Centralized error handling function
export const handleError = (
  error: unknown & { status?: number },
  customMessage?: string
): void => {
  if (error?.status === 401) {
    return;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    const message = error.response?.data?.message || error.message;

    if (status === 429) {
      notyf.error({
        message: "Too many requests. Please wait.",
        duration: 0,
      });
    } else if (!ACCEPTED_ERROR_CODES.includes(status || 0)) {
      notyf.error({
        message: customMessage || "Something went wrong. Please try again.",
        duration: 0,
      });
    } else {
      notyf.error({
        message,
        duration: 0,
      });
    }
  } else if (error instanceof Error) {
    notyf.error({
      message: customMessage || error.message,
      duration: 0,
    });
  } else {
    notyf.error({
      message: customMessage || "An unexpected error occurred.",
      duration: 0,
    });
  }
};

const ApiService: ApiService = {
  instance: null,
  logout: null,

  init(logout) {
    this.logout = logout;
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: configService.VITE_APP_API_BASE_URL,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Request interceptor to check token and refresh if needed
      this.instance.interceptors.request.use(
        async (config) => {
          const token = getToken();

          // If there's no token, proceed without auth header
          if (!token) {
            return config;
          }

          // Check if token is expired
          const isTokenValid = checkExpiry(token);

          if (!isTokenValid) {
            if (isRefreshing) {
              // If already refreshing, wait for the new token
              return new Promise((resolve) => {
                refreshSubscribers.push((newToken: string) => {
                  config.headers["Authorization"] = `Bearer ${newToken}`;
                  resolve(config);
                });
              });
            }

            isRefreshing = true;
            try {
              const refreshToken = getRefreshToken();
              if (!refreshToken) {
                store.dispatch(SET_TOKEN_EXPIRED(true));
                return Promise.reject(new Error("No refresh token available"));
              }
            } catch (error) {
              store.dispatch(SET_TOKEN_EXPIRED(true));
              return Promise.reject(error);
            } finally {
              isRefreshing = false;
            }
          } else {
            config.headers["Authorization"] = `Bearer ${token}`;
          }

          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Response interceptor to handle 401 errors
      this.instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError) => {
          if (error.response?.status === 401) {
            store.dispatch(SET_TOKEN_EXPIRED(true));
          }
          return Promise.reject(error);
        }
      );
    }
  },

  /**
   * Set the default HTTP request headers
   */

  setHeader(header, val) {
    if (this.instance) this.instance.defaults.headers[header] = val;
  },

  // set token  in header
  setAuthToken(token) {
    if (this.instance)
      this.instance.defaults.headers["Authorization"] = `Bearer ${
        token || getToken()
      }`;
  },

  /**
   * Set the default Base URL of api requests
   */

  setDefaultBaseUrl(url = configService.VITE_APP_API_BASE_URL) {
    if (this.instance) this.instance.defaults.baseURL = url;
  },

  /**
   * Check if the user is currently rate limited
   * @returns {boolean}
   */
  isRateLimited() {
    return isRateLimited && Date.now() < rateLimitTimestamp + 10000;
  },

  /**
   * Set the rate limit and update timestamp
   */
  setRateLimit() {
    isRateLimited = true;
    rateLimitTimestamp = Date.now();
  },

  /**
   * Reset the rate limit and timestamp
   */
  resetRateLimit() {
    isRateLimited = false;
    rateLimitTimestamp = 0;
  },

  /**
   * Send the GET HTTP request
   * @param resource
   * @param slug
   * @param params
   * @param baseURL
   * @returns {*}
   */

  get(
    resource: string,
    slug: string = "",
    params: unknown = {},
    baseURL?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setAuthToken();

      const url = `${resource}${slug ? `/${slug}` : ""}`;
      if (!baseURL) this.setDefaultBaseUrl(configService.VITE_APP_API_BASE_URL);
      if (this.isRateLimited()) {
        // If rate limited, show notification and reject the promise
        handleError({ status: 429 }, "Too many requests. Please wait.");
        reject({ status: 429, message: "Too many requests. Please wait." });
        return;
      }

      this?.instance
        ?.get(url, { params, baseURL })
        .then((res) => {
          this.resetRateLimit();
          resolve(res.data);
        })
        .catch((error) => {
          handleError(error);
          reject(error?.response);
        });

      if (baseURL) this.setDefaultBaseUrl();
    });
  },

  getWithAbort(
    resource: string,
    slug: string = "",
    params: unknown = {},
    baseURL?: string
  ): [Promise<any>, AbortController] {
    const controller = new AbortController();
    return [
      new Promise((resolve, reject) => {
        const token = localStorage.getItem("token");
        const IsValid: boolean = checkExpiry(token);
        if (!IsValid) {
          store.dispatch(SET_TOKEN_EXPIRED(true));
          return;
        }
        this.setAuthToken();
        const url = `${resource}${slug ? `/${slug}` : ""}`;
        if (!baseURL)
          this.setDefaultBaseUrl(configService.VITE_APP_API_BASE_URL);
        if (this.isRateLimited()) {
          handleError({ status: 429 }, "Too many requests. Please wait.");
          reject({ status: 429, message: "Too many requests. Please wait." });
          return;
        }

        this?.instance
          ?.get(url, { params, baseURL, signal: controller.signal })
          .then((res) => {
            this.resetRateLimit();
            resolve(res.data);
          })
          .catch((error) => {
            if (isCancel(error)) {
              return reject({ isCanceled: true });
            }
            handleError(error);
            reject(error?.response);
          });

        if (baseURL) this.setDefaultBaseUrl();
      }),
      controller,
    ];
  },

  /**
   * Set the POST HTTP request
   * @param resource
   * @param params
   * @param slug
   * @param isFormData//true or false
   * @param baseURL
   * @returns {*}
   */

  post(
    resource: string,
    params: unknown = {},
    slug: string = "",
    isFormData: boolean = false,
    baseURL?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setAuthToken();
      if (!baseURL) this.setDefaultBaseUrl(configService.VITE_APP_API_BASE_URL);
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };
      this.instance

        ?.post(`${resource}${slug ? `/${slug}` : ""}`, params, {
          headers,
          baseURL,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            return reject(error?.response);
          }
          if (error.request) {
            // The request was made, but no response was received (e.g., network error, backend down)
            return reject({
              message:
                "No response from the server. Please check your network connection or try again later.",
            });
          }
          return reject({ message: "Unexpected error: " + error.message });
        });
      if (baseURL) this.setDefaultBaseUrl();
    });
  },
  /**
   * Set the POST HTTP request
   * @param resource
   * @param params
   * @param slug
   * @param isFormData//true or false
   * @param baseURL
   * @returns {*}
   */

  patch(
    resource: string,
    params: unknown = {},
    slug: string = "",
    isFormData: boolean = false,
    baseURL?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setAuthToken();

      if (!baseURL) this.setDefaultBaseUrl(configService.VITE_APP_API_BASE_URL);
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };
      this.instance

        ?.patch(`${resource}${slug ? `/${slug}` : ""}`, params, {
          headers,
          baseURL,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            return reject(error?.response);
          }
          if (error.request) {
            // The request was made, but no response was received (e.g., network error, backend down)
            return reject({
              message:
                "No response from the server. Please check your network connection or try again later.",
            });
          }
          return reject({ message: "Unexpected error: " + error.message });
        });

      if (baseURL) this.setDefaultBaseUrl();
    });
  },

  /**
   * Set the POST HTTP request
   * @param resource
   * @param params
   * @param slug
   * @param isFormData//true or false
   * @param baseURL
   * @returns {*}
   */
  patchWithAbort(
    resource: string,
    params: unknown = {},
    slug: string = "",
    isFormData: boolean = false,
    baseURL?: string
  ): [Promise<any>, AbortController] {
    const controller = new AbortController();
    return [
      new Promise((resolve, reject) => {
        const token = localStorage.getItem("token");
        const IsValid: boolean = checkExpiry(token);
        if (!IsValid) {
          console.log("Token Expired");
          store.dispatch(SET_TOKEN_EXPIRED(true));
          return;
        }
        this.setAuthToken();

        if (!baseURL)
          this.setDefaultBaseUrl(configService.VITE_APP_API_BASE_URL);
        const headers = isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" };
        this.instance
          ?.patch(`${resource}${slug ? `/${slug}` : ""}`, params, {
            headers,
            baseURL,
            signal: controller.signal,
          })
          .then((res) => {
            resolve(res.data);
          })
          .catch((error) => {
            if (isCancel(error)) {
              return reject({ isCanceled: true });
            }

            if (error.response) {
              return reject(error?.response);
            }
            if (error.request) {
              // The request was made, but no response was received (e.g., network error, backend down)
              return reject({
                message:
                  "No response from the server. Please check your network connection or try again later.",
              });
            }
            return reject({ message: "Unexpected error: " + error.message });
          });

        if (baseURL) this.setDefaultBaseUrl();
      }),
      controller,
    ];
  },

  /**
   * Send the PUT HTTP request
   * @param resource
   * @param params
   * @param slug
   * @param isFormData
   * @param baseURL
   * @returns {Promise<void>}
   */

  put(
    resource: string,
    slug?: string,
    params?: any,
    isFormData?: boolean,
    baseURL?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setAuthToken();

      if (!baseURL) this.setDefaultBaseUrl(configService.VITE_APP_API_BASE_URL);
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

      this.instance

        ?.put(`${resource}${slug ? `/${slug}` : ""}`, params, {
          headers,
          baseURL,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            return reject(error?.response);
          }
          if (error.request) {
            // The request was made, but no response was received (e.g., network error, backend down)
            return reject({
              message:
                "No response from the server. Please check your network connection or try again later.",
            });
          }
          return reject({ message: "Unexpected error: " + error.message });
        });
    });
  },

  /**
   * Send the DELETE HTTP request
   * @param resource
   * @param slug
   * @param params
   * @param isFormData
   * @param baseURL
   * @returns {*}
   */

  delete(
    resource: string,
    slug: string = "",
    params: unknown = {},
    isFormData: boolean = false,
    baseURL?: string
  ): Promise<any> {
    this.setAuthToken();
    const headers = isFormData
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" };

    return new Promise((resolve, reject) => {
      if (!baseURL) this.setDefaultBaseUrl(configService.VITE_APP_API_BASE_URL);
      this.instance

        ?.delete(`${resource}${slug ? `/${slug}` : ""}`, {
          headers,
          data: params,
          baseURL,
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((error) => {
          if (error.response) {
            return reject(error?.response);
          }
          if (error.request) {
            // The request was made, but no response was received (e.g., network error, backend down)
            return reject({
              message:
                "No response from the server. Please check your network connection or try again later.",
            });
          }
          return reject({ message: "Unexpected error: " + error.message });
        });
    });
  },
};

export default ApiService;
