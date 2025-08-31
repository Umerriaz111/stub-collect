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
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  PriceChange,
  Sell,
  Event,
  Person,
  Star,
  FlashOn,
  MoreVert,
  Edit,
  Delete,
  LocationOn,
  EventSeat,
  AttachMoney,
  CalendarToday,
  ConfirmationNumber,
  Description,
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
  isMyStubsPage = false, // New prop to determine if it's the My Stubs page
  onEdit, // Callback for edit action
  onDelete, // Callback for delete action
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(listingStatus === "listed");
  const [openDialog, setOpenDialog] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);

  // Custom theme colors
  const primaryColor = "rgb(251 134 28)"; // Dark orange
  const secondaryColor = "rgb(251 146 29)"; // Gold/yellow
  const darkBlue = "#0A2463"; // Dark blue
  const darkBackground = "#121212"; // Dark background
  const cardBackground = "#173d5cff"; // Slightly lighter dark for cards
  const accentColor = "rgb(191 59 54)"; // Coral accent
  const stubGradient = "linear-gradient(135deg, #1a365d 0%, #2d3748 50%, #1a202c 100%)";
  const perforatedBorder = "repeating-linear-gradient(90deg, transparent, transparent 8px, #fb8a1c 8px, #fb8a1c 12px)";

  // Extract stub information
  const eventName = stub?.event_name || title;
  const eventDate = stub?.event_date || date;
  const venueName = stub?.venue_name;
  const seatInfo = stub?.seat_info;
  const ticketPrice = stub?.ticket_price || price;
  const rawText = stub?.raw_text;

  const handleBuyNow = (e) => {
    e.stopPropagation();
    onBuyNow && onBuyNow(stub);
  };

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    e && e.stopPropagation();
    setAnchorEl(null);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onEdit && onEdit(stub);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    onDelete && onDelete(stub);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
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
          width: 320,
          height: "100%",
          borderRadius: "16px",
          boxShadow: isHovered
            ? `0 12px 24px ${primaryColor}40, 0 0 20px ${primaryColor}20`
            : "0 8px 16px rgba(0,0,0,0.4)",
          transition: "all 0.3s ease",
          textDecoration: "none",
          background: stubGradient,
          border: `2px solid ${primaryColor}40`,
          position: "relative",
          overflow: "hidden",
          transform: isHovered ? "translateY(-8px) scale(1.02)" : "none",
          "&:hover": {
            boxShadow: `0 16px 32px ${primaryColor}60, 0 0 30px ${primaryColor}30`,
            borderColor: primaryColor,
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: perforatedBorder,
            zIndex: 1,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: perforatedBorder,
            zIndex: 1,
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Ticket Stub Header */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)",
          }}
        >
          <ConfirmationNumber sx={{ color: darkBlue, mr: 1 }} />
          <Typography
            variant="h6"
            sx={{
              color: darkBlue,
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontSize: "0.9rem",
            }}
          >
            Event Ticket
          </Typography>
        </Box>

        {/* Premium Ribbon */}
        {ticketPrice > 500 && (
          <Box
            sx={{
              position: "absolute",
              top: 70,
              right: -35,
              backgroundColor: accentColor,
              color: "white",
              padding: "6px 40px",
              transform: "rotate(45deg)",
              zIndex: 2,
              boxShadow: `0 4px 8px ${accentColor}80`,
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          >
            <Typography variant="caption" fontWeight={700}>
              PREMIUM
            </Typography>
          </Box>
        )}

        {/* Three Dots Menu - Only for My Stubs page */}
        {isMyStubsPage && (
          <Box
            sx={{
              position: "absolute",
              top: 75,
              left: 15,
              zIndex: 3,
            }}
          >
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: `${darkBackground}DD`,
                color: secondaryColor,
                "&:hover": {
                  backgroundColor: `${primaryColor}DD`,
                  color: darkBlue,
                },
                transition: "all 0.2s ease",
                backdropFilter: "blur(6px)",
                border: `1px solid ${primaryColor}40`,
              }}
              size="small"
            >
              <MoreVert />
            </IconButton>
          </Box>
        )}

        <Box
          onClick={onClick}
          sx={{
            height: "100%",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            paddingTop: "60px", // Account for header
          }}
        >
          {/* Main Event Image Section */}
          <Box
            sx={{
              position: "relative",
              height: 180,
              overflow: "hidden",
              margin: "8px",
              borderRadius: "12px",
              border: `2px solid ${primaryColor}30`,
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "50%",
                background: `linear-gradient(to top, ${darkBackground}EE, transparent)`,
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
                transform: isHovered ? "scale(1.08)" : "scale(1)",
                filter: isHovered ? "brightness(1.2)" : "brightness(0.8)",
              }}
            />

            {/* Price Badge */}
            {ticketPrice && (
              <Chip
                icon={<AttachMoney fontSize="small" sx={{ color: darkBlue }} />}
                label={`${currency} ${ticketPrice}`}
                sx={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  backgroundColor: secondaryColor,
                  color: darkBlue,
                  fontWeight: 800,
                  fontSize: "1rem",
                  zIndex: 1,
                  boxShadow: `0 4px 8px ${darkBlue}60`,
                  border: `2px solid ${darkBlue}`,
                }}
              />
            )}
          </Box>

          {/* Ticket Information Section */}
          <CardContent
            sx={{
              padding: "16px",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              background: `linear-gradient(to bottom, transparent, ${darkBackground}40)`,
              backdropFilter: "blur(2px)",
              "&:last-child": {
                paddingBottom: "16px",
              },
            }}
          >
            {/* Event Title */}
            <Typography
              gutterBottom
              component="div"
              sx={{
                fontWeight: 800,
                color: "white",
                fontSize: "1.1rem",
                mb: 1.5,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                fontFamily: "'Bebas Neue', sans-serif",
                textShadow: `0 0 12px ${primaryColor}60`,
                lineHeight: 1.2,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {eventName}
            </Typography>

            {/* Venue Information */}
            {venueName && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <LocationOn fontSize="small" sx={{ mr: 1, color: primaryColor }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: secondaryColor,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {venueName}
                </Typography>
              </Box>
            )}

            {/* Event Date */}
            {eventDate && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CalendarToday fontSize="small" sx={{ mr: 1, color: primaryColor }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: secondaryColor,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {new Date(eventDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    weekday: "short",
                  })}
                </Typography>
              </Box>
            )}

            {/* Seat Information */}
            {seatInfo && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <EventSeat fontSize="small" sx={{ mr: 1, color: primaryColor }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: secondaryColor,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {seatInfo}
                </Typography>
              </Box>
            )}

            {/* Event Description */}
            {rawText && (
              <Tooltip
                title={rawText.length > 100 ? rawText : ""}
                arrow
                placement="bottom"
                sx={{
                  "& .MuiTooltip-tooltip": {
                    backgroundColor: `${darkBackground}F5`,
                    color: secondaryColor,
                    border: `1px solid ${primaryColor}40`,
                    fontSize: "0.85rem",
                    maxWidth: 300,
                    lineHeight: 1.4,
                    padding: "12px",
                    borderRadius: "8px",
                    backdropFilter: "blur(8px)",
                  },
                  "& .MuiTooltip-arrow": {
                    color: `${darkBackground}F5`,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1.5 }}>
                  <Description fontSize="small" sx={{ mr: 1, color: primaryColor, mt: 0.2 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: `${secondaryColor}`,
                      fontWeight: 500,
                      fontSize: "0.85rem",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: rawText.length > 100 ? "help" : "default",
                      "&:hover": {
                        color: rawText.length > 100 ? secondaryColor : `${secondaryColor}CC`,
                      },
                      transition: "color 0.2s ease",
                    }}
                  >
                    {rawText}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {/* Seller Info */}
            {showSeller && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 1.5,
                  padding: "8px 12px",
                  backgroundColor: `${primaryColor}15`,
                  borderRadius: "8px",
                  border: `1px solid ${primaryColor}30`,
                  width: "fit-content",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: `${primaryColor}25`,
                    transform: "translateX(4px)",
                  },
                  transition: "all 0.2s ease",
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
                    bgcolor: primaryColor,
                    color: darkBackground,
                    mr: 1.5,
                    border: `2px solid ${secondaryColor}`,
                  }}
                >
                  {sellerName?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: `${secondaryColor}CC`,
                      fontSize: "0.7rem",
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Seller
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ 
                      color: secondaryColor,
                      fontSize: "0.85rem",
                    }}
                  >
                    {sellerName}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Buy Now Button - Only shown if price exists and not My Stubs page */}
            {ticketPrice && !isMyStubsPage && (
              <Button
                variant="contained"
                onClick={handleBuyNow}
                startIcon={<FlashOn />}
                sx={{
                  mt: 1,
                  mb: 1.5,
                  background: `linear-gradient(135deg, ${accentColor}, ${primaryColor})`,
                  color: "white",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  boxShadow: `0 6px 12px ${accentColor}40`,
                  border: `2px solid ${primaryColor}`,
                  borderRadius: "12px",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                    boxShadow: `0 8px 16px ${primaryColor}60`,
                    transform: "translateY(-2px)",
                    borderColor: secondaryColor,
                  },
                  "&:active": {
                    transform: "translateY(1px)",
                  },
                  transition: "all 0.3s ease",
                }}
                fullWidth
              >
                Buy Now
              </Button>
            )}

            {/* Ticket Separator Line */}
            <Box
              sx={{
                height: "2px",
                background: `repeating-linear-gradient(90deg, ${primaryColor} 0px, ${primaryColor} 8px, transparent 8px, transparent 16px)`,
                margin: "8px 0",
                opacity: 0.6,
              }}
            />

            {/* Listing Status Toggle - Only for My Stubs page */}
            {listingStatus && isMyStubsPage && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: "auto",
                  pt: 1,
                  justifyContent: "space-between",
                  backgroundColor: `${primaryColor}10`,
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${primaryColor}30`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Sell
                    fontSize="medium"
                    sx={{
                      mr: 1.5,
                      color: checked ? primaryColor : `${secondaryColor}60`,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: `${secondaryColor}CC`,
                        fontSize: "0.7rem",
                        display: "block",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Status
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: checked ? primaryColor : secondaryColor,
                        fontSize: "0.9rem",
                      }}
                    >
                      {checked ? "Listed for Sale" : "Not Listed"}
                    </Typography>
                  </Box>
                </Box>
                <Tooltip
                  title={checked ? "Remove from marketplace" : "List in marketplace"}
                >
                  <Switch
                    checked={checked}
                    onChange={handleChange}
                    color="default"
                    sx={{
                      "& .MuiSwitch-thumb": {
                        color: checked ? primaryColor : secondaryColor,
                        boxShadow: `0 2px 4px ${checked ? primaryColor : secondaryColor}40`,
                      },
                      "& .MuiSwitch-track": {
                        backgroundColor: checked
                          ? `${primaryColor}40`
                          : `${secondaryColor}30`,
                      },
                    }}
                  />
                </Tooltip>
              </Box>
            )}
          </CardContent>
        </Box>
      </Card>

      {/* Three Dots Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: `${darkBackground}F0`,
            border: `2px solid ${primaryColor}`,
            borderRadius: "12px",
            boxShadow: `0 12px 24px ${primaryColor}30`,
            backdropFilter: "blur(8px)",
          },
        }}
      >
        <MenuItem
          onClick={handleEdit}
          sx={{
            color: secondaryColor,
            padding: "12px 20px",
            borderRadius: "8px",
            margin: "4px",
            "&:hover": {
              backgroundColor: `${primaryColor}25`,
              color: "white",
            },
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" sx={{ color: primaryColor }} />
          </ListItemIcon>
          <ListItemText>
            <Typography fontWeight={600}>Edit Stub</Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            color: secondaryColor,
            padding: "12px 20px",
            borderRadius: "8px",
            margin: "4px",
            "&:hover": {
              backgroundColor: `${accentColor}25`,
              color: "white",
            },
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: accentColor }} />
          </ListItemIcon>
          <ListItemText>
            <Typography fontWeight={600}>Delete Stub</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        sx={{
          "& .MuiDialog-paper": {
            background: `linear-gradient(135deg, ${darkBackground} 0%, #2A2A2A 100%)`,
            borderRadius: "16px",
            border: `3px solid ${accentColor}`,
            boxShadow: `0 16px 32px ${accentColor}40`,
            maxWidth: "420px",
            width: "100%",
            color: secondaryColor,
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            color: "white",
            fontSize: "1.3rem",
            fontWeight: 700,
            textAlign: "center",
            borderBottom: `2px solid ${accentColor}30`,
            paddingBottom: 2,
          }}
        >
          ⚠️ Delete Event Ticket
        </DialogTitle>
        <DialogContent sx={{ padding: "24px" }}>
          <Typography 
            sx={{ 
              color: secondaryColor,
              fontSize: "1rem",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            Are you sure you want to permanently delete this ticket stub for{" "}
            <strong style={{ color: primaryColor }}>"{eventName}"</strong>?
            <br />
            <br />
            This action cannot be undone and all ticket data will be lost.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px 24px", gap: 2 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{ 
              color: secondaryColor,
              borderColor: secondaryColor,
              fontWeight: 600,
              padding: "8px 24px",
              "&:hover": {
                backgroundColor: `${secondaryColor}15`,
                borderColor: primaryColor,
              }
            }}
          >
            Keep Ticket
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{ 
              backgroundColor: accentColor,
              color: "white",
              fontWeight: 700,
              padding: "8px 24px",
              "&:hover": {
                backgroundColor: `${accentColor}CC`,
                boxShadow: `0 4px 8px ${accentColor}40`,
              }
            }}
          >
            Delete Forever
          </Button>
        </DialogActions>
      </Dialog>

      {/* Price Input Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        sx={{
          "& .MuiDialog-paper": {
            background: `linear-gradient(135deg, ${darkBackground} 0%, #2A2A2A 100%)`,
            borderRadius: "16px",
            border: `3px solid ${primaryColor}`,
            boxShadow: `0 16px 32px ${primaryColor}40`,
            maxWidth: "420px",
            width: "100%",
            color: secondaryColor,
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            color: "white",
            fontSize: "1.3rem",
            fontWeight: 700,
            textAlign: "center",
            borderBottom: `2px solid ${primaryColor}30`,
            paddingBottom: 2,
          }}
        >
          💰 Set Listing Price
        </DialogTitle>
        <DialogContent sx={{ padding: "24px" }}>
          <Typography 
            sx={{ 
              color: secondaryColor,
              mb: 3,
              textAlign: "center",
              fontSize: "0.95rem",
            }}
          >
            Set your asking price for "{eventName}"
          </Typography>
          <TextField
            autoFocus
            label="Asking Price"
            type="number"
            fullWidth
            variant="outlined"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 1, color: primaryColor, fontWeight: 700 }}>
                  {currency} $
                </Typography>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                backgroundColor: `${primaryColor}10`,
                borderRadius: "12px",
                "& fieldset": {
                  borderColor: `${primaryColor}60`,
                  borderWidth: "2px",
                },
                "&:hover fieldset": {
                  borderColor: primaryColor,
                },
                "&.Mui-focused fieldset": {
                  borderColor: primaryColor,
                  borderWidth: "3px",
                },
              },
              "& .MuiInputLabel-root": {
                color: secondaryColor,
                fontWeight: 600,
                "&.Mui-focused": {
                  color: primaryColor,
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px 24px", gap: 2 }}>
          <Button 
            onClick={handleDialogClose}
            variant="outlined"
            sx={{ 
              color: secondaryColor,
              borderColor: secondaryColor,
              fontWeight: 600,
              padding: "8px 24px",
              "&:hover": {
                backgroundColor: `${secondaryColor}15`,
                borderColor: primaryColor,
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDialogSubmit}
            variant="contained"
            sx={{ 
              backgroundColor: primaryColor,
              color: darkBlue,
              fontWeight: 700,
              padding: "8px 24px",
              "&:hover": {
                backgroundColor: secondaryColor,
                boxShadow: `0 4px 8px ${primaryColor}40`,
              }
            }}
          >
            List Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StubCard;
