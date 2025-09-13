import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackToMainButton = ({ 
  to = "/", 
  label = "Home",
  backgroundColor = "rgb(249, 194, 100)",
  color = "black",
  hoverColor = "blue",
  position = { top: 10, left: 0 }
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: position.top,
        left: position.left,
        backgroundColor: backgroundColor,
        display: "flex",
        borderRadius: "0px 10px 10px 0px",
        px: 2,
        cursor: "pointer",
        textDecoration: "none",
        color: color,
        alignItems: "center",
        fontSize: 20,
        zIndex: 1000,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateX(3px)",
          boxShadow: "0 3px 10px rgba(249, 194, 100, 0.4)",
        }
      }}
    >
      <Typography
        component={Link}
        to={to}
        sx={{
          cursor: "pointer",
          textDecoration: "none",
          color: color,
          display: "flex",
          alignItems: "center",
          ":hover": {
            color: hoverColor,
          },
        }}
      >
        <IconButton 
          size="small"
          sx={{ 
            color: "inherit",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        {label}
      </Typography>
    </Box>
  );
};

export default BackToMainButton;
