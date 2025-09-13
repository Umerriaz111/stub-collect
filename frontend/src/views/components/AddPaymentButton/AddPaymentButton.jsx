import { useEffect, useState } from "react";
import {
  checkSellerStatus,
  startStripeOnboarding,
} from "../../../core/api/paymentmethods";
import { useNavigate } from "react-router-dom";

export const AddPaymentButton = ({ listing }) => {
  const [onboardingUrl, setOnboardingUrl] = useState(null);
  const navigate = useNavigate();

  const handlePaymentClick = async () => {
    // First check if seller is onboarded

    const status = await checkSellerStatus();
    if (!status.hasAccount) {
      // Start onboarding flow
      const onboarding = await startStripeOnboarding();
      if (onboarding.success) {
        setOnboardingUrl(onboarding.onboardingUrl);
        // window.open(onboarding.onboardingUrl, "_blank");
        navigate(`/seller-onboarding?url=${onboarding.onboardingUrl}`);
      }
      return;
    }
    if (!status.canAcceptPayments) {
      // Show requirements needed
      alert(
        `Please complete these requirements: ${status.requirementsDue.join(
          ", "
        )}`
      );
      return;
    }
    // Proceed with payment
    // (You would open your payment modal or redirect to checkout here)
  };

  // if (onboardingUrl) {
  //   // Redirect to Stripe onboarding
  //   window.location.href = onboardingUrl;
  //   return null;
  // }

  return <div onClick={handlePaymentClick}>Add payment method</div>;
};
