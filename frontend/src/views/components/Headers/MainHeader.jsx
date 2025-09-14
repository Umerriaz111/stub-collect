import {
  Button,
  Grid,
  Typography,
  useMediaQuery,
  AppBar,
  Toolbar,
  Container,
  Box,
} from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { CloudUpload } from "@mui/icons-material";
import ProfileMenu from "./ProfileMenu";

export default function MainHeader() {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <AppBar
      position="fixed"
      sx={{
        background:
          "linear-gradient(180deg,rgb(65, 28, 7) 0%,rgb(253, 253, 253 , 0.1) 100%)",
        boxShadow: "0 4px 40px rgba(0,0,0,0.3)",
        // borderBottom: "3px solidrgb(12, 12, 12)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 70, md: 50 }, py: 1 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            {/* Left section with logo */}
            <Grid item xs={6} md={4}>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                  letterSpacing: "3px",
                  textShadow: "2px 2px 0px rgba(0,0,0,0.3)",
                  background:
                    "linear-gradient(to right, #ffeb3b,rgb(248, 248, 248))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  "&:hover": {
                    textShadow: "3px 3px 0px rgba(0,0,0,0.3)",
                  },
                }}
              >
                STUBCOLLECT
              </Typography>
            </Grid>

            {/* Center section - empty in this design */}
            <Grid item md={4} sx={{ display: { xs: "none", md: "block" } }} />

            {/* Right section with buttons */}
            <Grid
              item
              xs={6}
              md={4}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                startIcon={<CloudUpload sx={{ color: "#000" }} />}
                onClick={() => navigate("/add-new-stub")}
                sx={{
                  borderRadius: "25px",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  fontSize: isSmallScreen ? "0.7rem" : "0.8rem",
                  py: 1,
                  px: 3,
                  color: "#000",
                  background: "#ffeb3b",
                  border: "2px solid #000",
                  boxShadow: "4px 4px 0px rgba(0,0,0,0.2)",
                  "&:hover": {
                    background: "#ffd600",
                    transform: "translateY(-2px)",
                    boxShadow: "6px 6px 0px rgba(0,0,0,0.3)",
                  },
                }}
              >
                Upload Stub
              </Button>

              <ProfileMenu />
            </Grid>
          </Grid>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
