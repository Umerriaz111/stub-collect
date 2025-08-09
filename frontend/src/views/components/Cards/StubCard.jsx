import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Avatar,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Tooltip,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  PriceChange,
  Sell,
  Event,
  Person,
  Star,
  FlashOn,
} from "@mui/icons-material";
import { orange } from "@mui/material/colors";

const StubCard = ({
  stub,
  image,
  title,
  price,
  currency = "USD",
  onClick,
  date,
  sellerName,
  showSeller,
  sellerId,
  listingStatus,
  handleListingSubmit,
  onBuyNow, // New prop for buy now functionality
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(listingStatus === "listed");
  const [openDialog, setOpenDialog] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  // Custom theme colors
  const primaryColor = "rgb(251 134 28)"; // Dark orange
  const secondaryColor = "rgb(251 146 29)"; // Gold/yellow
  const darkBlue = "#0A2463"; // Dark blue
  const darkBackground = "#121212"; // Dark background
  const cardBackground = "#173d5cff"; // Slightly lighter dark for cards
  const accentColor = "rgb(191 59 54)"; // Coral accent

  const handleBuyNow = (e) => {
    e.stopPropagation();
    onBuyNow && onBuyNow(stub);
  };

  const handleChange = (event) => {
    event.preventDefault();
    event.stopPropagation();
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
          boxShadow:
            "0 20px 40px rgba(255, 255, 255, 1), 0 10px 20px rgba(255, 255, 255, 1), 0 6px 6px rgba(255, 255, 255, 1)",
          width: 280,
          height: "100%",
          borderRadius: "20px",
          boxShadow: isHovered
            ? `0 12px 24px ${primaryColor}30`
            : "0 4px 12px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
          textDecoration: "none",
          background: cardBackground,
          border: `1px solid ${secondaryColor}30`,
          position: "relative",
          overflow: "hidden",
          transform: isHovered ? "translateY(-4px)" : "none",
          "&:hover": {
            boxShadow: `0 12px 24px ${primaryColor}50`,
            borderColor: `${secondaryColor}80`,
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Premium Ribbon */}
        {price > 500 && (
          <Box
            sx={{
              position: "absolute",
              top: 10,
              right: -30,
              backgroundColor: secondaryColor,
              color: darkBlue,
              padding: "4px 30px",
              transform: "rotate(45deg)",
              zIndex: 1,
              boxShadow: `0 2px 4px ${darkBlue}`,
              fontWeight: 700,
            }}
          >
            <Typography variant="caption" fontWeight={700}>
              PREMIUM
            </Typography>
          </Box>
        )}

        <Box
          onClick={onClick}
          sx={{
            height: "100%",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Image Section */}
          <Box
            sx={{
              position: "relative",
              height: 280,
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "40%",
                background: `linear-gradient(to top, ${darkBackground}DD, transparent)`,
              },
            }}
          >
            <Box
              sx={{
                height: "100%",
                backgroundImage: `url(${image})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                transition: "transform 0.5s ease",
                transform: isHovered ? "scale(1.05)" : "scale(1)",
                filter: isHovered ? "brightness(1.1)" : "brightness(0.9)",
              }}
            />

            {/* Price Badge */}
            {price && (
              <Chip
                icon={<PriceChange fontSize="small" sx={{ color: darkBlue }} />}
                label={`${currency} ${price}`}
                sx={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  backgroundColor: secondaryColor,
                  color: darkBlue,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  zIndex: 1,
                  boxShadow: `0 2px 4px ${darkBlue}80`,
                }}
              />
            )}
          </Box>

          {/* Content Section */}
          <CardContent
            sx={{
              padding: "16px",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              background: `linear-gradient(to bottom, ${cardBackground}, #2A2A2A)`,
              "&:last-child": {
                paddingBottom: "16px",
              },
            }}
          >
            {/* Title */}
            <Typography
              gutterBottom
              component="div"
              noWrap
              sx={{
                fontWeight: 700,
                color: "white",
                fontSize: "1.1rem",
                mb: 1,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontFamily: "'Bebas Neue', sans-serif",
                textShadow: `0 0 8px ${primaryColor}80`,
              }}
            >
              {title}
            </Typography>

            {/* Seller Info */}
            {showSeller && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1.5,
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
                    width: 28,
                    height: 28,
                    bgcolor: primaryColor,
                    color: darkBackground,
                    mr: 1,
                  }}
                >
                  {sellerName?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ color: secondaryColor }}
                >
                  {sellerName}
                </Typography>
              </Box>
            )}

            {/* Date */}
            {date && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <Event fontSize="small" sx={{ mr: 1, color: primaryColor }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: secondaryColor,
                    fontWeight: 500,
                    fontSize: "0.85rem",
                    opacity: 0.9,
                  }}
                >
                  {new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
            )}

            {/* Buy Now Button - Only shown if price exists */}
            {price && (
              <Button
                variant="contained"
                onClick={handleBuyNow}
                startIcon={<FlashOn />}
                sx={{
                  mt: 1,
                  mb: 1.5,
                  // background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                  backgroundColor: accentColor,
                  color: secondaryColor,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  boxShadow: `0 4px 8px ${primaryColor}40`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${primaryColor}E6, ${accentColor}E6)`,
                    boxShadow: `0 6px 12px ${primaryColor}60`,
                    transform: "translateY(-1px)",
                  },
                  "&:active": {
                    transform: "translateY(1px)",
                  },
                  transition: "all 0.2s ease",
                }}
                fullWidth
              >
                Buy Now
              </Button>
            )}

            <Divider sx={{ my: 1, borderColor: `${primaryColor}40` }} />

            {/* Listing Status Toggle */}
            {listingStatus && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: "auto",
                  pt: 1,
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Sell
                    fontSize="small"
                    sx={{
                      mr: 1,
                      color: checked ? primaryColor : `${secondaryColor}80`,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: secondaryColor,
                    }}
                  >
                    {checked ? "Listed" : "Unlisted"}
                  </Typography>
                </Box>
                <Tooltip
                  title={checked ? "Unlist this item" : "List this item"}
                >
                  <Switch
                    checked={checked}
                    onChange={handleChange}
                    color="default"
                    size="small"
                    sx={{
                      "& .MuiSwitch-thumb": {
                        color: checked ? primaryColor : secondaryColor,
                      },
                      "& .MuiSwitch-track": {
                        backgroundColor: checked
                          ? `${primaryColor}30`
                          : `${secondaryColor}20`,
                      },
                    }}
                  />
                </Tooltip>
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
            background: `linear-gradient(135deg, #2A2A2A 0%, #1E1E1E 100%)`,
            borderRadius: "12px",
            border: `2px solid ${primaryColor}`,
            boxShadow: `0 8px 16px ${primaryColor}30`,
            maxWidth: "400px",
            width: "100%",
            color: secondaryColor,
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
