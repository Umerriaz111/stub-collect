import { loadStripe } from "@stripe/stripe-js";
import { getApi } from "./apiService";

export const checkSellerStatus = async () => {
  try {
    const api = await getApi();
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
    const api = await getApi();
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
  "pk_test_51RawVnKc8GJcFDUJzbqQOAvUKhp3MFwvVdN6ZTVLxiyZfggzuzL3opcszJFpkpbGpxdcvVVr0Dj940jtEvREM0hl009j4AcrXf"
);

export const createPaymentIntent = async (listingId) => {
  try {
    const api = await getApi();
    const response = await api.post("/api/payments/create-payment-intent", {
      listing_id: listingId,
    });
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

export const getOrderStatus = async (orderId) => {
  try {
    const api = await getApi();
    const response = await api.get(`/api/orders/${orderId}/status`);
    const data = response.data;
    if (data.status === "success") {
      return {
        success: true,
        order: data.order,
      };
    } else {
      return {
        success: false,
        error: data.message,
      };
    }
  } catch (error) {
    console.error("Error fetching order status:", error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch order status",
    };
  }
};

export const completeOrder = async (orderId) => {
  try {
    const api = await getApi();
    const response = await api.post(`/api/payments/orders/${orderId}/complete`);
    const data = response.data;
    if (data.status === "success") {
      return {
        success: true,
        message: data.message,
        orderStatus: data.order_status,
        payoutNote: data.payout_note,
      };
    } else {
      return {
        success: false,
        error: data.message,
      };
    }
  } catch (error) {
    console.error("Error completing order:", error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to complete order",
    };
  }
};
