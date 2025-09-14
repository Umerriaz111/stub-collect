import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import authRightBg from "../../../assets/authrightbg.png";
import { useMediaQuery } from "@mui/material";
import logo from "../../../assets/StubCollect_Logo/Transparent/StubCollect_Logo_Clean_400x400.png";
import tabLogo from "../../../assets/StubCollect_Logo/Transparent/StubCollect_Logo_Clean_200x200.png";
import mobileLogo from "../../../assets/StubCollect_Logo/Transparent/StubCollect_Logo_Clean_100x100.png";

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
        px: 2,
      }}
    >
      <Box textAlign="center">
        {/* <Typography
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
        </Typography> */}
        <img
          src={isMobile ? mobileLogo : isTab ? tabLogo : logo}
          alt="StubCollect"
        />
      </Box>
    </Grid>
  );
}

export default AuthPageRightSide;
