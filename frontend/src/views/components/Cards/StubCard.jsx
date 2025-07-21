import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CardActionArea,
  useTheme,
  Avatar,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const StubCard = ({
  stub,
  image,
  title,
  price,
  currency,
  onClick,
  link,
  date,
  sellerName,
  showSeller,
  sellerId,
  listingStatus,
  handleListingSubmit, // Function to call when listing with new price
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(listingStatus === "listed");
  const [openDialog, setOpenDialog] = useState(false);
  const [newPrice, setNewPrice] = useState("");

  const handleChange = (event) => {
    event.preventDefault();
    if (listingStatus === "listed") {
      // we will unlist the stub from here
    } else {
      setOpenDialog(true);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewPrice("");
  };

  const handleDialogSubmit = () => {
    if (newPrice && !isNaN(newPrice)) {
      setChecked(true);
      handleListingSubmit({
        stub_id: stub?.id,
        asking_price: newPrice,
        currency: "USD",
      });
      // onListWithNewPrice && onListWithNewPrice(newPrice);
      handleDialogClose();
    }
  };

  return (
    <>
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
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-8px) scale(1.02)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: -4,
            left: -4,
            right: 4,
            bottom: 4,
            border: "2px dashed #ff4081",
            zIndex: -1,
            opacity: 0.7,
          },
        }}
        //   component={Link}
        // to={link || "#"}
      >
        <Box onClick={onClick} sx={{ height: "100%", padding: "0px" }}>
          <Box
            sx={{
              backgroundColor: "transparent",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 180,
              borderBottom: "2px dashed #000",
              backgroundImage: `url(${image})`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
            }}
          ></Box>
          <CardContent
            sx={{
              padding: "16px",
              "&:last-child": {
                paddingBottom: "16px",
              },
            }}
          >
            {showSeller && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  my: 1,
                  width: "fit-content",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/seller-profile/${sellerId}`);
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "red",
                    color: "white",
                    border: "1px solid",
                    borderColor: "rgb(249, 194, 100)",
                    mr: 1,
                  }}
                >
                  {sellerName?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography
                  variant="body2"
                  fontWeight={"bold"}
                  sx={{ color: "black" }}
                >
                  {sellerName}
                </Typography>
              </Box>
            )}
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

            {price && (
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
              </Box>
            )}

            {listingStatus && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <Typography variant="body2" fontWeight={"bold"} sx={{ mr: 1 }}>
                  {checked ? "Listed" : "Unlisted"}
                </Typography>
                <Switch
                  checked={checked}
                  onChange={handleChange}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Box>
      </Card>

      {/* Price Input Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "rgba(243, 199, 142, 0.83)",
            borderRadius: "20px",
            border: "2px solid",
            borderColor: "rgb(251, 167, 57)",
          },
        }}
      >
        <DialogTitle>Set Price for Listing</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            variant="outlined"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 1 }}>{currency}</Typography>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StubCard;
