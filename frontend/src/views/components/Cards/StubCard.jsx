import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CardActionArea,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";

const StubCard = ({ image, title, price, currency, onClick, link, date }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        width: 280,
        height: "100%",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
        transition: "transform 0.3s, box-shadow 0.3s",
        textDecoration: "none",
        background: "linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)",
        backgroundImage:
          "url(https://images.unsplash.com/photo-1746639643018-e600b8c194b8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJldHJvJTIwY29taWMlMjBibHVlJTIwYmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D)",
        border: "2px solid #000",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          border: "2px dashed #ff4081",
          borderRadius: "16px",
          zIndex: -1,
          opacity: 0.7,
        },
      }}
      component={Link}
      to={link || "#"}
    >
      <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
        <Box
          sx={{
            p: 1,
            backgroundColor: "transparent",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 180,
            borderBottom: "2px dashed #000",
            // background:
            //   "linear-gradient(to right, rgba(5, 0, 0, 0.5), rgba(0, 0, 0, 0.5))",
          }}
        >
          <CardMedia
            component="img"
            height="100%"
            image={image}
            alt={title}
            sx={{
              objectFit: "contain",
              maxHeight: "100%",
              maxWidth: "100%",
              filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
            }}
          />
        </Box>
        <CardContent
          sx={{
            padding: "16px",
            "&:last-child": {
              paddingBottom: "16px",
            },
          }}
        >
          <Typography
            gutterBottom
            component="div"
            noWrap
            sx={{
              fontWeight: 800,
              color: "#000",
              letterSpacing: "0.5px",
              fontSize: "14px",
              textAlign: "center",
              mb: 1,
              textTransform: "uppercase",
              fontFamily: "'Bebas Neue', cursive, sans-serif",
            }}
          >
            {title}
          </Typography>

          {date && (
            <Typography
              variant="body2"
              sx={{
                color: "#ff4081",
                fontWeight: 700,
                textAlign: "center",
                mb: 1,
                fontSize: "0.9rem",
                fontStyle: "italic",
              }}
            >
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 2,
              p: 1,
              backgroundColor: "#000",
              borderRadius: "8px",
              color: "#fff",
            }}
          >
            {price && (
              <Typography
                variant="h6"
                sx={{
                  color: "#ffeb3b",
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  letterSpacing: "1px",
                }}
              >
                {currency} {price}
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default StubCard;
