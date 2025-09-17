import React, { useEffect, useState } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Box,
  ListItemIcon,
  Tooltip,
  Badge,
  Button,
  useTheme,
} from "@mui/material";
import {
  Logout,
  AccountCircleRounded,
  CollectionsBookmark,
  Settings,
} from "@mui/icons-material";
import { TOGGLE_THEME } from "../../../core/store/App/appSlice";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import notyf from "../NotificationMessage/notyfInstance";
import { checkAuthStatusApi, logoutApi } from "../../../core/api/auth";
import PaidIcon from "@mui/icons-material/Paid";

export default function ProfileMenu() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const themeMode = useSelector((state) => state?.app?.themeMode);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await checkAuthStatusApi();

        if (response?.data?.data?.is_authenticated) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await logoutApi();
      if (response?.data?.status === "success") {
        navigate("/login");
        notyf.success("Logout successful");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      notyf.error("Logout failed. Please try again.");
    }
  };

  if (!isAuthenticated) {
    const theme = useTheme();

    const handleLoginClick = () => {
      navigate("/login");
    };

    const handleSignupClick = () => {
      navigate("/signup");
    };
    return (
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleLoginClick}
          sx={{
            borderRadius: "25px",
            px: 3,
            py: 1,
            borderColor: theme.palette.orange?.dark || "#FB921D",
            color: theme.palette.orange?.dark || "#FB921D",
            "&:hover": {
              backgroundColor: theme.palette.orange?.dark || "#FB921D",
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
    );
  }

  return (
    <>
      <Tooltip title="Account settings" arrow>
        <IconButton
          data-testid="profile-menu-btn"
          onClick={handleClick}
          size="small"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{
            transition: "all 0.2s ease-in-out",
            backgroundColor: user ? "primary.main" : "transparent",

            "&:hover": {
              backgroundColor: user ? "primary.dark" : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                color="success"
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "transparent",
                    color: "white",
                  }}
                >
                  {user.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
            </Box>
          ) : (
            <Avatar
              alt="login-user"
              src="Avatar.png"
              sx={{ width: 40, height: 40 }}
            />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              width: 250,
              backgroundColor: "rgba(251, 167, 57, 0.55)",
              border: "2px solid",
              borderColor: "rgb(251, 167, 57)",
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
              mt: 1.5,
              borderRadius: 2,
              "& .MuiMenuItem-root": {
                px: 2,
                py: 1.5,
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: "primary.lighter",
                },
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="600">
            Welcome back,
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user || "Guest User"}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <MenuItem component={Link} to="/feed">
          <ListItemIcon>
            <CollectionsBookmark fontSize="small" color="primary" />
          </ListItemIcon>
          My Stubs
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem component={Link} to="/connect-payments">
          <ListItemIcon>
            <PaidIcon fontSize="small" color="primary" />
          </ListItemIcon>
          Connect Payments
        </MenuItem>

        {/* <MenuItem>
          <ListItemIcon>
            <Settings fontSize="small" color="primary" />
          </ListItemIcon>
          Settings
        </MenuItem> */}

        <Divider sx={{ my: 1 }} />

        {/* <LogoutHandler> */}
        <MenuItem data-testid="logout-btn" onClick={() => handleLogout()}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Logout</Typography>
        </MenuItem>
        {/* </LogoutHandler> */}
      </Menu>
    </>
  );
}
