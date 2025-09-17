import {
  Button,
  CircularProgress,
  Typography,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import { Box, useTheme } from "@mui/system";
import React, { useEffect, useState } from "react";
import {
  checkSellerStatus,
  startStripeOnboarding,
} from "../../../core/api/paymentmethods";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Link } from "react-router-dom";
import BackToMainButton from "../../components/BackToMainButton/BackToMainButton";

const ConnectPayments = () => {
  const theme = useTheme();

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
      setStatus(response.account_info);
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
      if (onboarding.status === "success") {
        setOnboardingUrl(onboarding.onboarding_url);
        window.open(onboarding.onboarding_url);
        // Refresh status after onboarding
        // setTimeout(() => {
        //   fetchStatus();
        // }, 2000);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setBoardingLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!status?.has_account) return "error";
    if (status?.can_accept_payments) return "success";
    if (status?.onboarding_completed === false) return "warning";
    return "info";
  };

  const getStatusText = () => {
    if (!status?.has_account) return "Not Connected";
    if (status?.can_accept_payments) return "Fully Verified";
    if (status?.onboarding_completed === false) return "Pending Verification";
    return "Processing";
  };

  const getStatusIcon = () => {
    if (!status?.has_account) return <ErrorIcon />;
    if (status?.can_accept_payments) return <CheckCircleIcon />;
    if (status?.onboarding_completed === false) return <WarningIcon />;
    return <WarningIcon />;
  };

  const renderRequirements = () => {
    if (!status?.requirements_due || status.requirements_due.length === 0) {
      return null;
    }

    const formatRequirement = (req) => {
      const requirements = {
        business_type: "Business Type Information",
        external_account: "Bank Account Details",
        "representative.dob.day": "Representative Date of Birth (Day)",
        "representative.dob.month": "Representative Date of Birth (Month)",
        "representative.dob.year": "Representative Date of Birth (Year)",
        "representative.email": "Representative Email",
        "representative.first_name": "Representative First Name",
        "representative.last_name": "Representative Last Name",
        "tos_acceptance.date": "Terms of Service Acceptance",
        "tos_acceptance.ip": "Terms Acceptance IP Address",
      };
      return requirements[req] || req.replace(/_/g, " ").replace(/\./g, " - ");
    };

    return (
      <Card
        sx={{ mt: 3, backgroundColor: "#fff3cd", border: "1px solid #ffeaa7" }}
      >
        <CardContent>
          <Typography variant="h6" color="warning.main" gutterBottom>
            <WarningIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Required Information Missing
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Please complete the following requirements to start accepting
            payments:
          </Typography>
          <List dense>
            {status.requirements_due.map((req, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon>
                  <ErrorIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={formatRequirement(req)}
                  primaryTypographyProps={{ fontSize: "0.9rem" }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
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
        alignItems: "flex-start",
        position: "relative",
        py: 4,
      }}
    >
      <BackToMainButton />

      <Box sx={{ width: "100%", maxWidth: "800px", px: 2 }}>
        <Typography
          variant="h4"
          textAlign="center"
          sx={{
            color: "rgb(68, 42, 11)",
            mb: 4,
            fontWeight: "bold",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          Payment Setup Center
        </Typography>

        <Paper
          elevation={8}
          sx={{
            borderRadius: 4,
            p: 4,
            backgroundColor: theme.palette.orange?.light,
            backdropFilter: "blur(10px)",
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                py: 8,
              }}
            >
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography
                variant="h5"
                textAlign="center"
                color="text.secondary"
              >
                Loading your payment setup...
              </Typography>
              <Typography
                variant="body2"
                textAlign="center"
                color="text.secondary"
                mt={1}
              >
                Please hold on while we fetch your account details
              </Typography>
            </Box>
          ) : (
            <>
              {/* Header Section */}
              <Box textAlign="center" mb={4}>
                <Typography variant="h5" gutterBottom color="text.primary">
                  Stripe Payment Integration
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Connect your bank account securely to receive payouts from
                  your sales
                </Typography>
              </Box>

              {/* Status Overview */}
              <Card
                sx={{
                  mb: 3,
                  backgroundColor:
                    getStatusColor() === "success"
                      ? "#d4edda"
                      : getStatusColor() === "warning"
                      ? "#fff3cd"
                      : "#f8d7da",
                  border: `2px solid ${
                    getStatusColor() === "success"
                      ? "#28a745"
                      : getStatusColor() === "warning"
                      ? "#ffc107"
                      : "#dc3545"
                  }`,
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                  >
                    <Box display="flex" alignItems="center">
                      {getStatusIcon()}
                      <Typography variant="h6" ml={1} color="text.primary">
                        Account Status: {getStatusText()}
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusText()}
                      color={getStatusColor()}
                      variant="filled"
                      size="small"
                    />
                  </Box>

                  {status?.has_account && (
                    <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                      <Chip
                        icon={<AccountBalanceIcon />}
                        label={`Account ID: ${
                          status.account_id?.slice(-8) || "N/A"
                        }`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<BusinessIcon />}
                        label={`Country: ${status.country || "N/A"}`}
                        variant="outlined"
                        size="small"
                      />
                      {status.business_type && (
                        <Chip
                          icon={<PersonIcon />}
                          label={`Type: ${status.business_type}`}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Detailed Status */}
                  <Box
                    display="flex"
                    justifyContent="space-around"
                    textAlign="center"
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Account Connected
                      </Typography>
                      <Typography
                        variant="h6"
                        color={
                          status?.has_account ? "success.main" : "error.main"
                        }
                      >
                        {status?.has_account ? "✅ Yes" : "❌ No"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Onboarding Complete
                      </Typography>
                      <Typography
                        variant="h6"
                        color={
                          status?.onboarding_completed
                            ? "success.main"
                            : "warning.main"
                        }
                      >
                        {status?.onboarding_completed
                          ? "✅ Complete"
                          : "⏳ Pending"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Can Accept Payments
                      </Typography>
                      <Typography
                        variant="h6"
                        color={
                          status?.can_accept_payments
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {status?.can_accept_payments
                          ? "✅ Ready"
                          : "❌ Not Ready"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Requirements Section */}
              {renderRequirements()}

              {/* Success Message */}
              {status?.can_accept_payments && (
                <Alert severity="success" sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    🎉 Congratulations! Your payment setup is complete!
                  </Typography>
                  <Typography variant="body2">
                    You can now receive payments from customers. All
                    transactions will be processed securely through Stripe.
                  </Typography>
                </Alert>
              )}

              {/* Action Buttons */}
              <Box display="flex" justifyContent="center" gap={2} mt={4}>
                {(!status?.has_account || !status?.onboarding_completed) && (
                  <Button
                    disabled={boardingLoading}
                    onClick={startOnBoarding}
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      borderRadius: 3,
                    }}
                  >
                    {!status?.has_account
                      ? "Connect Stripe Account"
                      : "Complete Setup"}
                    {boardingLoading ? (
                      <CircularProgress
                        size={20}
                        sx={{ ml: 1, color: "white" }}
                      />
                    ) : (
                      <ArrowOutwardIcon sx={{ ml: 1 }} />
                    )}
                  </Button>
                )}

                <Button
                  onClick={fetchStatus}
                  variant="outlined"
                  color="primary"
                  size="large"
                  startIcon={<RefreshIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                  }}
                >
                  Refresh Status
                </Button>
              </Box>

              {/* Security Notice */}
              <Paper
                elevation={1}
                sx={{
                  mt: 4,
                  p: 3,
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                }}
              >
                <Typography
                  variant="body2"
                  textAlign="center"
                  color="text.secondary"
                >
                  <strong>🔒 Security Notice:</strong> Your financial
                  information is encrypted and handled securely by Stripe, a
                  PCI-compliant payments provider trusted by millions of
                  businesses worldwide. We never store your banking details on
                  our servers.
                </Typography>
              </Paper>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ConnectPayments;
