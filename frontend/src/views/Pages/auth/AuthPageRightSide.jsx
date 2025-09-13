import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import authRightBg from "../../../assets/authrightbg.png";
import { useMediaQuery } from "@mui/material";

function AuthPageRightSide() {
  const isTab = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <Grid
      item
      container
      xs={12}
      sm={6}
      sx={{
        backgroundColor: "transparent",
        backgroundPosition: "center",
        backgroundSize: "cover",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "right",
        p: 4,
      }}
    >
      <Box textAlign="center">
        <Typography
          variant={isMobile ? "h4" : isTab ? "h3" : "h2"}
          fontWeight={700}
          sx={{ color: "white", letterSpacing: 2 }}
        >
          STUB
        </Typography>
        <Typography
          variant={isMobile ? "h4" : isTab ? "h3" : "h2"}
          fontWeight={300}
          sx={{ color: "white", letterSpacing: 1 }}
        >
          COLLECT
        </Typography>
        {/* <Typography
          variant="subtitle1"
          sx={{
            color: "white",
            opacity: 0.8,
            mt: 2,
            maxWidth: "400px",
            mx: "auto",
          }}
        >
          Streamline your document collection and management process
        </Typography> */}
      </Box>
    </Grid>
  );
}

export default AuthPageRightSide;
