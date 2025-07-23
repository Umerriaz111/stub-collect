import config from "../services/configService";
import axios from "axios";

const API_BASE_URL = config.VITE_APP_API_BASE_URL;

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const checkSellerStatus = async () => {
  try {
    const response = await api.get("/payments/connect/status");

    const data = response.data;

    if (data.status === "success") {
      return {
        hasAccount: data.account_info.has_account,
        accountStatus: data.account_info.status,
        canAcceptPayments: data.account_info.can_accept_payments,
        onboardingCompleted: data.account_info.onboarding_completed,
        capabilitiesEnabled: data.account_info.capabilities_enabled,
        requirementsDue: data.account_info.requirements_due,
      };
    }

    return { hasAccount: false };
  } catch (error) {
    console.error("Error checking seller status:", error);
    return {
      hasAccount: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error occurred",
    };
  }
};

export const startStripeOnboarding = async () => {
  try {
    const response = await api.post("/payments/connect/onboard");

    const data = response.data;

    if (data.status === "success") {
      return {
        success: true,
        onboardingUrl: data.onboarding_url,
        accountId: data.account_id,
      };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Onboarding initialization failed",
    };
  }
};
