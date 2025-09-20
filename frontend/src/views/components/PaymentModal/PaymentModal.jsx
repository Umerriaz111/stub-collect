import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import {
  CreditCard,
  Security,
  Schedule,
  AttachMoney,
  Close,
  CheckCircle,
} from "@mui/icons-material";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Load Stripe
const stripePromise = loadStripe(
  "pk_test_51RawVnKc8GJcFDUJzbqQOAvUKhp3MFwvVdN6ZTVLxiyZfggzuzL3opcszJFpkpbGpxdcvVVr0Dj940jtEvREM0hl009j4AcrXf"
);

// Custom theme colors
const primaryColor = "rgb(251 134 28)"; // Dark orange
const secondaryColor = "rgb(251 146 29)"; // Gold/yellow
const darkBlue = "#0A2463"; // Dark blue
const darkBackground = "#121212"; // Dark background
const accentColor = "rgb(191 59 54)"; // Coral accent

// Card Element styles
const cardElementStyles = {
  style: {
    base: {
      fontSize: "16px",
      color: "white",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      backgroundColor: "transparent",
      "::placeholder": {
        color: "#aab7c4",
      },
      iconColor: primaryColor,
    },
    invalid: {
      color: accentColor,
      iconColor: accentColor,
    },
    complete: {
      iconColor: "#4caf50",
    },
  },
};

const PaymentForm = ({
  stub,
  paymentData,
  onPaymentSuccess,
  onPaymentError,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        console.error("Payment failed:", error);
        setPaymentError(error.message);
        onPaymentError(error);
      } else if (paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent);
        onPaymentSuccess({
          paymentIntent,
          orderId: paymentData.orderId,
          stub,
        });
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setPaymentError(err.message || "An unexpected error occurred");
      onPaymentError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Stub Information Card */}
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${darkBackground}DD 0%, #2A2A2ADD 100%)`,
          border: `2px solid ${primaryColor}40`,
          borderRadius: "12px",
        }}
      >
        <CardContent sx={{ padding: "16px" }}>
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: 700,
              mb: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <AttachMoney sx={{ mr: 1, color: primaryColor }} />
            Purchase Summary
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" sx={{ color: secondaryColor }}>
              Event:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "white",
                fontWeight: 600,
                maxWidth: "200px",
                textAlign: "right",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {stub.event_name}
            </Typography>
          </Box>

          {stub.venue_name && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" sx={{ color: secondaryColor }}>
                Venue:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "white", fontWeight: 600 }}
              >
                {stub.venue_name}
              </Typography>
            </Box>
          )}

          {stub.event_date && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" sx={{ color: secondaryColor }}>
                Date:
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "white", fontWeight: 600 }}
              >
                {new Date(stub.event_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1.5, borderColor: `${primaryColor}30` }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography
              variant="body1"
              sx={{ color: "white", fontWeight: 700 }}
            >
              Total Amount:
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: primaryColor,
                fontWeight: 800,
              }}
            >
              ${stub.asking_price}
            </Typography>
          </Box>

          {paymentData.liabilityShifted && (
            <Chip
              icon={<Security />}
              label="Buyer Protected"
              size="small"
              sx={{
                mt: 1,
                backgroundColor: `${primaryColor}20`,
                color: primaryColor,
                border: `1px solid ${primaryColor}60`,
                "& .MuiChip-icon": {
                  color: primaryColor,
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Typography
        variant="h6"
        sx={{
          color: "white",
          fontWeight: 700,
          mb: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <CreditCard sx={{ mr: 1, color: primaryColor }} />
        Payment Information
      </Typography>

      {/* Card Element */}
      <Box
        sx={{
          p: 2,
          border: `2px solid ${
            cardError
              ? accentColor
              : cardComplete
              ? "#4caf50"
              : `${primaryColor}40`
          }`,
          borderRadius: "12px",
          backgroundColor: `${darkBackground}80`,
          mb: 2,
          transition: "border-color 0.3s ease",
        }}
      >
        <CardElement options={cardElementStyles} onChange={handleCardChange} />
      </Box>

      {/* Card Error */}
      {cardError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            backgroundColor: `${accentColor}20`,
            border: `1px solid ${accentColor}`,
            "& .MuiAlert-message": {
              color: "white",
            },
          }}
        >
          {cardError}
        </Alert>
      )}

      {/* Payment Error */}
      {paymentError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            backgroundColor: `${accentColor}20`,
            border: `1px solid ${accentColor}`,
            "& .MuiAlert-message": {
              color: "white",
            },
          }}
        >
          {paymentError}
        </Alert>
      )}

      {/* Security Notice */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          backgroundColor: `${primaryColor}10`,
          borderRadius: "8px",
          border: `1px solid ${primaryColor}30`,
          mb: 3,
        }}
      >
        <Security sx={{ mr: 1, color: primaryColor }} />
        <Typography variant="body2" sx={{ color: secondaryColor }}>
          Your payment is secured by Stripe. We never store your card details.
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isProcessing}
          sx={{
            color: secondaryColor,
            borderColor: secondaryColor,
            fontWeight: 600,
            padding: "10px 24px",
            "&:hover": {
              backgroundColor: `${secondaryColor}15`,
              borderColor: primaryColor,
            },
            "&:disabled": {
              color: `${secondaryColor}60`,
              borderColor: `${secondaryColor}30`,
            },
          }}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || !cardComplete || isProcessing}
          sx={{
            backgroundColor: primaryColor,
            color: darkBlue,
            fontWeight: 700,
            padding: "10px 32px",
            minWidth: "120px",
            "&:hover": {
              backgroundColor: secondaryColor,
              boxShadow: `0 4px 8px ${primaryColor}40`,
            },
            "&:disabled": {
              backgroundColor: `${primaryColor}40`,
              color: `${darkBlue}60`,
            },
          }}
        >
          {isProcessing ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: darkBlue }} />
              Processing...
            </>
          ) : (
            `Pay $${stub.asking_price}`
          )}
        </Button>
      </Box>
    </Box>
  );
};

const PaymentModal = ({
  open,
  onClose,
  stub,
  paymentData,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (!open) {
      setPaymentCompleted(false);
    }
  }, [open]);

  const handlePaymentSuccess = (successData) => {
    setPaymentCompleted(true);
    setTimeout(() => {
      onPaymentSuccess(successData);
    }, 2000); // Show success message for 2 seconds
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          background: `linear-gradient(135deg, ${darkBackground} 0%, #2A2A2A 100%)`,
          borderRadius: "16px",
          border: `3px solid ${primaryColor}`,
          boxShadow: `0 16px 32px ${primaryColor}40`,
          color: secondaryColor,
          backdropFilter: "blur(10px)",
          minHeight: "400px",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "white",
          fontSize: "1.5rem",
          fontWeight: 700,
          textAlign: "center",
          borderBottom: `2px solid ${primaryColor}30`,
          paddingBottom: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {paymentCompleted ? (
            <>
              <CheckCircle sx={{ mr: 1, color: "#4caf50" }} />
              Payment Successful!
            </>
          ) : (
            <>
              <CreditCard sx={{ mr: 1, color: primaryColor }} />
              Complete Your Purchase
            </>
          )}
        </Box>

        <Button
          onClick={onClose}
          size="small"
          sx={{
            minWidth: "auto",
            p: 0.5,
            color: secondaryColor,
            "&:hover": {
              backgroundColor: `${accentColor}20`,
            },
          }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ padding: "24px" }}>
        {paymentCompleted ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircle sx={{ fontSize: 80, color: "#4caf50", mb: 2 }} />
            <Typography
              variant="h5"
              sx={{ color: "white", fontWeight: 700, mb: 1 }}
            >
              Payment Successful!
            </Typography>
            <Typography variant="body1" sx={{ color: secondaryColor, mb: 2 }}>
              Your purchase of "{stub.event_name}" has been completed.
            </Typography>
            <Typography variant="body2" sx={{ color: `${secondaryColor}80` }}>
              You will receive a confirmation email shortly.
            </Typography>
          </Box>
        ) : (
          <Elements stripe={stripePromise}>
            <PaymentForm
              stub={stub}
              paymentData={paymentData}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={onPaymentError}
              onClose={onClose}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
