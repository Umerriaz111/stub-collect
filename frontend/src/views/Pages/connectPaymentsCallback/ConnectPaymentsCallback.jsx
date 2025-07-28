import { CircularProgress, IconButton, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, keyframes, styled } from "@mui/system";
import { Cancel, CheckCircle } from "@mui/icons-material";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const StatusWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: 300,
  height: 300,
  borderRadius: "50%",
  backgroundColor: "orange",
  boxShadow: theme.shadows[6],
  position: "relative",
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const StatusIcon = styled(Box)({
  fontSize: 80,
  marginBottom: 16,
});

const ConnectPaymentsCallback = () => {
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status") || "loading";
  const message = searchParams.get("message");

  const [displayMessage, setDisplayMessage] = useState("");

  useEffect(() => {
    if (status === "loading") {
      setDisplayMessage("Processing payment...");
    } else if (status === "success") {
      setDisplayMessage(message || "Payment account connected!");
    } else if (status === "error") {
      setDisplayMessage(message || "Account connection failed!");
    }
  }, [status, message]);
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
      <Box
        my={2}
        fontSize={20}
        sx={{
          position: "absolute",
          top: 10,
          left: 0,
          //   border: "2px solid",
          //   borderColor: "rgb(249, 194, 100)",
          backgroundColor: "rgb(249, 194, 100)",
          display: "flex",
          //   borderRadius: 4,
          borderRadius: "0px 10px 10px 0px",
          px: 2,
          cursor: "pointer",
          textDecoration: "none",
          color: "black",
          alignItems: "center",
        }}
      >
        <Typography
          component={Link}
          to={"/"}
          sx={{
            cursor: "pointer",
            textDecoration: "none",
            color: "black",
            ":hover": {
              color: "blue",
            },
          }}
        >
          <IconButton>
            <ArrowBackIcon />
          </IconButton>{" "}
          Home
        </Typography>
        /
        <Typography
          component={Link}
          to={"/connect-payments"}
          sx={{
            cursor: "pointer",
            textDecoration: "none",
            color: "black",
            ":hover": {
              color: "blue",
            },
          }}
        >
          Connect-Payments
        </Typography>
      </Box>

      <Box
        sx={{
          backgroundColor: "rgba(255, 215, 170, 0.72)",
          width: "50vw",
          height: "60vh",
          borderRadius: 4,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          mt: 4,
        }}
      >
        <StatusWrapper>
          {status === "loading" && (
            <>
              <CircularProgress size={80} thickness={2} />
              <Typography variant="subtitle1" mt={2}>
                {displayMessage}
              </Typography>
            </>
          )}
          {status === "success" && (
            <>
              <StatusIcon sx={{ color: "success.main" }}>
                <CheckCircle fontSize="inherit" />
              </StatusIcon>
              <Typography variant="subtitle1" color="success.main">
                {displayMessage}
              </Typography>
            </>
          )}
          {status === "error" && (
            <>
              <StatusIcon sx={{ color: "error.main" }}>
                <Cancel fontSize="inherit" />
              </StatusIcon>
              <Typography variant="subtitle1" color="error.main">
                {displayMessage}
              </Typography>
            </>
          )}
        </StatusWrapper>
      </Box>
    </Box>
  );
};

export default ConnectPaymentsCallback;
