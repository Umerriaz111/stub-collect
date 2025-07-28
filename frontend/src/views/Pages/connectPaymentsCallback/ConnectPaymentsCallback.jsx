import { IconButton } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box } from "@mui/system";

const ConnectPaymentsCallback = () => {
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
        component={Link}
        to={"/connect-payments"}
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
        <IconButton>
          <ArrowBackIcon />
        </IconButton>{" "}
        Back
      </Box>

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
          mt: 4,
        }}
      >
        hello
      </Box>
    </Box>
  );
};

export default ConnectPaymentsCallback;
