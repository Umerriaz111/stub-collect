import config from "../services/configService";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

const API_BASE_URL = config.VITE_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const checkSellerStatus = async () => {
  try {
    const response = await api.get("/api/payments/connect/status");

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
    const response = await api.post("/api/payments/connect/onboard");

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

const stripePromise = loadStripe(
  "pk_test_51QlCWbJIDHKRj8Hxh5O35ATbVGsbYKEMrHZVoECkpWdxwf12tPzy5LuOQnGfeAXlRnQM8Z4srSYrCt4U75AXwA2y00bCqJ7qoT"
);

export const createPaymentIntent = async (listingId) => {
  try {
    const response = await api.post("/api/payments/create-payment-intent", {
      listing_id: listingId,
    });

    debugger;

    const data = response.data;

    if (data.status === "success") {
      return {
        success: true,
        clientSecret: data.client_secret,
        paymentIntentId: data.payment_intent_id,
        orderId: data.order_id,
        liabilityShifted: data.liability_shifted,
        payoutScheduleDays: data.payout_schedule_days,
      };
    } else {
      return {
        success: false,
        error: data.message,
        sellerRequirements: data.seller_requirements,
      };
    }
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Payment creation failed",
    };
  }
};
