import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleBrowseClick = () => {
    navigate("/dashboard");
  };

  const handleSellClick = () => {
    navigate("/dashboard?showUpload=true");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  // Desktop Menu Items
  const DesktopNavbar = () => (
    <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
      {/* Logo/Brand */}
      <Typography
        variant="h4"
        component="div"
        onClick={handleLogoClick}
        sx={{
          fontWeight: 800,
          color: theme.palette.primary.main,
          cursor: "pointer",
          background:
            theme.palette.gradients?.orangeGradient ||
            "linear-gradient(135deg, #FB921D 0%, #F59E0B 50%, #EAB308 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          "&:hover": {
            transform: "scale(1.02)",
            transition: "transform 0.2s ease-in-out",
          },
        }}
      >
        Stub Collector
      </Typography>

      {/* Navigation Links */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Button
          color="inherit"
          onClick={handleBrowseClick}
          sx={{
            fontSize: "16px",
            fontWeight: 600,
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: theme.palette.primary.lightBG,
              color: theme.palette.primary.main,
            },
          }}
        >
          Browse
        </Button>

        {/* Sell Dropdown */}
        <Button
          color="inherit"
          onClick={handleSellClick}
          sx={{
            fontSize: "16px",
            fontWeight: 600,
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: theme.palette.primary.lightBG,
              color: theme.palette.primary.main,
            },
          }}
        >
          Sell
        </Button>

        {/* Auth Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleLoginClick}
            sx={{
              borderRadius: "25px",
              px: 3,
              py: 1,
              borderColor: theme.palette.orange?.main || "#FB921D",
              color: theme.palette.orange?.main || "#FB921D",
              "&:hover": {
                backgroundColor: theme.palette.orange?.main || "#FB921D",
                color: "white",
              },
            }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            onClick={handleSignupClick}
            sx={{
              borderRadius: "25px",
              px: 3,
              py: 1,
              background:
                theme.palette.gradients?.warmGradient ||
                "linear-gradient(135deg, #FB921D 0%, #DC2626 100%)",
              "&:hover": {
                background:
                  theme.palette.gradients?.orangeGradient ||
                  "linear-gradient(135deg, #FB921D 0%, #F59E0B 50%, #EAB308 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(251,146,29,0.3)",
              },
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Toolbar>
  );

  // Mobile Drawer Content
  const MobileDrawer = () => (
    <Drawer
      anchor="right"
      open={mobileDrawerOpen}
      onClose={handleMobileDrawerToggle}
      PaperProps={{
        sx: { width: 280, pt: 2 },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 2, pb: 1 }}>
        <IconButton onClick={handleMobileDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
        <ListItem button onClick={handleBrowseClick}>
          <ListItemText primary="Browse" />
        </ListItem>

        <Divider />

        <ListItem button onClick={handleSellClick}>
          <ListItemText primary="Browse" />
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem button onClick={handleLoginClick}>
          <ListItemText primary="Login" />
        </ListItem>
        <ListItem button onClick={handleSignupClick}>
          <ListItemText primary="Sign Up" />
        </ListItem>
      </List>
    </Drawer>
  );

  // Mobile Navbar
  const MobileNavbar = () => (
    <Toolbar sx={{ justifyContent: "space-between" }}>
      <Typography
        variant="h5"
        component="div"
        onClick={handleLogoClick}
        sx={{
          fontWeight: 800,
          color: theme.palette.primary.main,
          cursor: "pointer",
        }}
      >
        Stub Collector
      </Typography>

      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={handleMobileDrawerToggle}
      >
        <MenuIcon />
      </IconButton>
    </Toolbar>
  );

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: theme.palette.orange[300],
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
        </Container>
      </AppBar>

      {isMobile && <MobileDrawer />}
    </>
  );
};

export default Navbar;
