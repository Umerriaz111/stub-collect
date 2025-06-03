import React from "react";
import { Grid, Typography } from "@mui/material";
import authRightBg from "../../../assets/authrightbg.png";
import { useMediaQuery } from "@mui/material";
// import { theme } from '../../../App'

function AuthPageRightSide() {
  const isTab = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  return (
    <Grid
      item
      container
      xs={12}
      sm={5}
      minHeight={"10vh"}
      sx={{
        backgroundImage: `url(${authRightBg})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <Typography
        variant={isMobile ? "h6" : isTab ? "h4" : "h2"}
        fontWeight={500}
        m={"auto"}
        sx={{ color: "white" }}
      >
        STUB
        <Typography
          variant={isMobile ? "h6" : isTab ? "h4" : "h2"}
          fontWeight={150}
          component={"span"}
          px={1}
        >
          COLLECTOR
        </Typography>
      </Typography>
    </Grid>
  );
}

export default AuthPageRightSide;
