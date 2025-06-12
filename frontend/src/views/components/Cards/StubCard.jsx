import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CardActionArea,
} from "@mui/material";

const StubCard = ({ image, title, price, currency, onClick }) => {
  return (
    <Card sx={{ maxWidth: 345, height: "100%" }}>
      <CardActionArea onClick={onClick}>
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={title}
          sx={{ objectFit: "contain" }}
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="body1"
            fontWeight={"bold"}
            component="div"
            noWrap
          >
            {title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <Typography variant="body2" color="success">
              {currency} {price}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default StubCard;
