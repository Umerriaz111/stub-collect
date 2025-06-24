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

const StubCard = ({
  image,
  title,
  price,
  currency,
  onClick,
  link,
  ticketPrice,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        maxWidth: 345,
        height: "100%",
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        transition: "transform 0.3s, box-shadow 0.3s",
        textDecoration: "none",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[6],
        },
      }}
      component={Link}
      to={link || "#"}
    >
      <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
        <Box
          sx={{
            p: 2,
            backgroundColor: "background.paper",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
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
            }}
          />
        </Box>
        <CardContent
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            "&:last-child": {
              paddingBottom: 2,
            },
          }}
        >
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            noWrap
            sx={{
              fontWeight: 600,
              color: "text.primary",
              letterSpacing: 0.5,
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 1,
            }}
          >
            {ticketPrice && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ flexGrow: 1 }}
              >
                Ticket Price: {ticketPrice}
              </Typography>
            )}
            {price && (
              <Typography
                variant="subtitle1"
                sx={{
                  color: "primary.main",
                  fontWeight: 700,
                  fontSize: "1.1rem",
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
