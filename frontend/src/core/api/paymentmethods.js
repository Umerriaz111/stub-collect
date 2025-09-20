import { loadStripe } from "@stripe/stripe-js";
import { getApi } from "./apiService";

export const checkSellerStatus = async () => {
  try {
    const api = await getApi();
    const response = await api.get("/api/payments/connect/status");
    return response.data;
  } catch (error) {
    console.error("Error checking seller status:", error);
    throw error;
  }
};

export const startStripeOnboarding = async () => {
  try {
    const api = await getApi();
    const response = await api.post("/api/payments/connect/onboard");
    return response.data;
  } catch (error) {
    console.error("Error starting Stripe onboarding:", error);
    throw error;
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
    return response.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
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
