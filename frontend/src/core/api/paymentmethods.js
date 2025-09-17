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
  "pk_test_51QlCWbJIDHKRj8Hxh5O35ATbVGsbYKEMrHZVoECkpWdxwf12tPzy5LuOQnGfeAXlRnQM8Z4srSYrCt4U75AXwA2y00bCqJ7qoT"
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
