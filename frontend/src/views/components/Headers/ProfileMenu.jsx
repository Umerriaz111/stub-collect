import React, { useState } from "react";
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
} from "@mui/material";
import {
  Logout,
  AccountCircleRounded,
  CollectionsBookmark,
  Settings,
} from "@mui/icons-material";
import LogoutHandler from "./LogoutHandler";
import { TOGGLE_THEME } from "../../../core/store/App/appSlice";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

export default function ProfileMenu() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const themeMode = useSelector((state) => state?.app?.themeMode);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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

        <MenuItem component={Link} to="/my-stubs">
          <ListItemIcon>
            <CollectionsBookmark fontSize="small" color="primary" />
          </ListItemIcon>
          My Stubs
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
            <Settings fontSize="small" color="primary" />
          </ListItemIcon>
          Settings
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <LogoutHandler>
          <MenuItem data-testid="logout-btn">
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="error">Logout</Typography>
          </MenuItem>
        </LogoutHandler>
      </Menu>
    </>
  );
}
