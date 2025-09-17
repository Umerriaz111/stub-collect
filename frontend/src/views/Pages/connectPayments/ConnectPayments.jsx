import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import {
  checkSellerStatus,
  startStripeOnboarding,
} from "../../../core/api/paymentmethods";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { Link } from "react-router-dom";
import BackToMainButton from "../../components/BackToMainButton/BackToMainButton";

const ConnectPayments = () => {
  const [onboardingUrl, setOnboardingUrl] = useState(null);
  const [status, setStatus] = useState(null);

  const [loading, setLoading] = useState(false);
  const [boardingLoading, setBoardingLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await checkSellerStatus();
      setStatus(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const startOnBoarding = async () => {
    try {
      setBoardingLoading(true);
      const onboarding = await startStripeOnboarding();
      if (onboarding.success) {
        setOnboardingUrl(onboarding.onboardingUrl);
        window.open(onboarding.onboardingUrl);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setBoardingLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1608555307638-992062b31329?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJldHJvJTIwY29taWMlMjBvcmFuZ2UlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "multiply",
        display: "flex",
        justifyContent: "center",
        // alignItems: "center",
        position: "relative",
      }}
    >
      <BackToMainButton />

      <Box>
        <Typography
          variant="h4"
          py={4}
          textAlign={"center"}
          sx={{
            mx: "auto",
            p: 2,
            borderRadius: "10px",
            color: "rgb(68, 42, 11)",
            my: 2,
          }}
        >
          Connect Payments
        </Typography>
        <Box
          sx={{
            backgroundColor: "rgba(255, 215, 170, 0.72)",
            width: "50vw",
            height: "60vh",
            borderRadius: 4,
            p: 4,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            // justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography variant="h4" p={8}>
                Loading your payment setup <br /> please hold on ...
              </Typography>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              <Typography variant="h4">Set Up Your Payment Method</Typography>
              <Typography variant="body1" mt={2}>
                To receive payouts from your sales, you need to connect your
                payment account securely via Stripe
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <Box display={"flex"}>
                  <Typography variant="h6" color="success">
                    Connection Status : {"  "}
                  </Typography>

                  <Typography
                    variant="h6"
                    ml={1}
                    sx={{ color: status?.hasAccount ? "green" : "red" }}
                  >
                    {"    "}
                    {status?.hasAccount
                      ? "Your payment account is connected ✅"
                      : "You're not connected"}
                  </Typography>
                </Box>

                <Box display={"flex"} mt={5}>
                  <Typography variant="h6" color="success">
                    Account Status : {"  "}
                  </Typography>

                  <Typography
                    variant="h6"
                    ml={1}
                    sx={{ color: status?.canAcceptPayments ? "green" : "red" }}
                  >
                    {"    "}
                    {status?.canAcceptPayments ? "Verified ✅" : "not Verified"}
                  </Typography>
                </Box>

                <Box mt={5}>
                  {!status?.hasAccount || !status.onboarding_completed ? (
                    <Button
                      disabled={boardingLoading}
                      onClick={startOnBoarding}
                      variant="contained"
                      color="success"
                      size="large"
                    >
                      Connect Now{" "}
                      {boardingLoading ? (
                        <CircularProgress
                          size={20}
                          sx={{ ml: 1, color: "white" }}
                        />
                      ) : (
                        <ArrowOutwardIcon sx={{ fontSize: "16px", ml: 1 }} />
                      )}
                    </Button>
                  ) : (
                    ""
                  )}
                </Box>
              </Box>
              <Typography
                mt={2}
                variant="body1"
                sx={{
                  textAlign: "center",
                  mt: "auto",
                }}
              >
                (Your information is encrypted and handled securely by Stripe, a
                leading global payments provider)
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ConnectPayments;
