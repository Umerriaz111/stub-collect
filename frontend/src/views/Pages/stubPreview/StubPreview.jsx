import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getStub } from "../../../core/api/stub";
import { createListing } from "../../../core/api/marketplace";
import config from "../../../core/services/configService";

const StubPreview = () => {
  const { stubId } = useParams();
  const navigate = useNavigate();
  const [stub, setStub] = useState(null);
  const [listingData, setListingData] = useState({
    asking_price: "",
    currency: "USD",
  });
  const [stubDetails, setStubDetails] = useState({
    event_name: "",
    venue_name: "",
    event_date: "",
    seat_info: "",
    ticket_price: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchStub = async () => {
      try {
        const response = await getStub(stubId);
        setStub(response.data.data);
        setStubDetails({
          event_name: response.data.data.event_name || "",
          venue_name: response.data.data.venue_name || "",
          event_date: response.data.data.event_date
            ? response.data.data.event_date.split("T")[0]
            : "",
          seat_info: response.data.data.seat_info || "",
          ticket_price: response.data.data.ticket_price || "",
          description: response.data.data.description || response.data.data.raw_text || "",
        });
      } catch (error) {
        setError("Failed to load stub details");
      }
    };
    fetchStub();
  }, [stubId]);

  const handleStubDetailChange = (e) => {
    const { name, value } = e.target;
    setStubDetails({
      ...stubDetails,
      [name]: value,
    });
  };

  const handleListingSubmit = async () => {
    try {
      setError("");
      setSuccess("");

      if (!listingData.asking_price) {
        setError("Please enter an asking price");
        return;
      }

      const response = await createListing({
        stub_id: stubId,
        ...listingData,
      });

      setSuccess("Successfully listed stub in marketplace!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create listing");
    }
  };

  if (!stub) {
    return (
      <Box sx={{ 
        p: 3, 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "50vh" 
      }}>
        <Card sx={{
          p: 4,
          background: "linear-gradient(135deg, rgba(252, 196, 132, 0.1) 0%, rgba(255, 138, 80, 0.05) 100%)",
          border: "1px solid rgba(252, 196, 132, 0.3)",
          borderRadius: "20px",
          textAlign: "center",
        }}>
          <Typography variant="h6" sx={{ 
            background: "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            🎫 Loading your stub...
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "80vw", m: "auto", mt: 6 ,  p: 1.5 }}>
      <Card sx={{
        background: "linear-gradient(135deg, rgba(252, 196, 132, 0.1) 0%, rgba(255, 138, 80, 0.05) 100%)",
        border: "1px solid rgba(252, 196, 132, 0.3)",
        borderRadius: "18px",
        boxShadow: "0 7px 28px rgba(252, 196, 132, 0.18)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 2.5, 
          borderBottom: 1, 
          borderColor: "rgba(252, 228, 200, 0.62)",
          background: "linear-gradient(135deg, rgba(252, 196, 132, 0.67) 0%, rgba(252, 152, 102, 0.71) 100%)",
          borderTopLeftRadius: "18px",
          borderTopRightRadius: "18px",
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{
              background: "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              mb: 1.5,
            }}
          >
            🎫 Stub Preview & Listing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review your stub details and list it in the marketplace
          </Typography>
        </Box>

        {/* Main Content - Image and Info Side by Side */}
        <Box sx={{ 
          p: 3,
          background: "linear-gradient(135deg, #fff8f0 0%, #fef5e7 100%)",
        }}>
          <Grid container spacing={3}>
            {/* Left Side - Image */}
            <Grid item xs={12} md={4}>
              <Paper sx={{
                p: 2,
                background: "#ffffff",
                border: "1px solid rgba(252, 196, 132, 0.2)",
                borderRadius: "14px",
                boxShadow: "0 4px 16px rgba(252, 196, 132, 0.12)",
                height: "fit-content",
              }}>
                <CardMedia
                  component="img"
                  image={`${config.VITE_APP_API_BASE_URL}/${stub.image_url}`}
                  alt={stub.title}
                  sx={{ 
                    width: "100%",
                    height: "auto",
                    maxHeight: "350px",
                    objectFit: "contain",
                    borderRadius: "10px",
                  }}
                />
              </Paper>
            </Grid>

            {/* Right Side - Info */}
            <Grid item xs={12} md={8}>
              <Box sx={{ height: "100%" }}>
                <Typography variant="h5" gutterBottom sx={{
                  color: "#ff6b35",
                  fontWeight: 600,
                  mb: 2.5,
                }}>
                  {stub.title}
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 1.5 }}>
                    {success}
                  </Alert>
                )}

                {/* Stub Details Section */}
                <Paper sx={{ 
                  mb: 2.5, 
                  p: 2.5,
                  background: "#ffffff",
                  border: "1px solid rgba(252, 196, 132, 0.2)",
                  borderRadius: "14px",
                  boxShadow: "0 4px 16px rgba(252, 196, 132, 0.12)",
                }}>
                  <Typography variant="h6" gutterBottom sx={{
                    background: "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 600,
                    mb: 2,
                  }}>
                    📝 Stub Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Event Name"
                        name="event_name"
                        value={stubDetails.event_name}
                        onChange={handleStubDetailChange}
                        size="small"
                        sx={{ 
                          mb: 1.5,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            backgroundColor: "#fff8f0",
                            border: "1px solid rgba(252, 196, 132, 0.3)",
                            "&:hover": {
                              borderColor: "rgba(255, 138, 80, 0.5)",
                            },
                            "&.Mui-focused": {
                              borderColor: "#ff6b35",
                              boxShadow: "0 0 0 2px rgba(255, 138, 80, 0.2)",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Venue Name"
                        name="venue_name"
                        value={stubDetails.venue_name}
                        onChange={handleStubDetailChange}
                        size="small"
                        sx={{ 
                          mb: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor: "#fff8f0",
                            border: "1px solid rgba(252, 196, 132, 0.3)",
                            "&:hover": {
                              borderColor: "rgba(255, 138, 80, 0.5)",
                            },
                            "&.Mui-focused": {
                              borderColor: "#ff6b35",
                              boxShadow: "0 0 0 2px rgba(255, 138, 80, 0.2)",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Event Date"
                        type="date"
                        name="event_date"
                        value={stubDetails.event_date}
                        onChange={handleStubDetailChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        sx={{ 
                          mb: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor: "#fff8f0",
                            border: "1px solid rgba(252, 196, 132, 0.3)",
                            "&:hover": {
                              borderColor: "rgba(255, 138, 80, 0.5)",
                            },
                            "&.Mui-focused": {
                              borderColor: "#ff6b35",
                              boxShadow: "0 0 0 2px rgba(255, 138, 80, 0.2)",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Original Ticket Price"
                        type="number"
                        name="ticket_price"
                        value={stubDetails.ticket_price}
                        onChange={handleStubDetailChange}
                        size="small"
                        sx={{ 
                          mb: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor: "#fff8f0",
                            border: "1px solid rgba(252, 196, 132, 0.3)",
                            "&:hover": {
                              borderColor: "rgba(255, 138, 80, 0.5)",
                            },
                            "&.Mui-focused": {
                              borderColor: "#ff6b35",
                              boxShadow: "0 0 0 2px rgba(255, 138, 80, 0.2)",
                            },
                          },
                        }}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1, color: "#ff6b35", fontWeight: 600 }}>$</Typography>,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Seat Info"
                        name="seat_info"
                        value={stubDetails.seat_info}
                        onChange={handleStubDetailChange}
                        size="small"
                        sx={{ 
                          mb: 1.5,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor: "#fff8f0",
                            border: "1px solid rgba(252, 196, 132, 0.3)",
                            "&:hover": {
                              borderColor: "rgba(255, 138, 80, 0.5)",
                            },
                            "&.Mui-focused": {
                              borderColor: "#ff6b35",
                              boxShadow: "0 0 0 2px rgba(255, 138, 80, 0.2)",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={stubDetails.description}
                        onChange={handleStubDetailChange}
                        multiline
                        rows={3}
                        size="small"
                        sx={{ 
                          mb: 0,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor: "#fff8f0",
                            border: "1px solid rgba(252, 196, 132, 0.3)",
                            "&:hover": {
                              borderColor: "rgba(255, 138, 80, 0.5)",
                            },
                            "&.Mui-focused": {
                              borderColor: "#ff6b35",
                              boxShadow: "0 0 0 2px rgba(255, 138, 80, 0.2)",
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Marketplace Listing Section */}
                <Paper sx={{ 
                  p: 2.5,
                  background: "#ffffff",
                  border: "1px solid rgba(252, 196, 132, 0.2)",
                  borderRadius: "14px",
                  boxShadow: "0 4px 16px rgba(252, 196, 132, 0.12)",
                }}>
                  <Typography variant="h6" gutterBottom sx={{
                    background: "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 600,
                    mb: 2,
                  }}>
                    🏪 List in Marketplace
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
                    <TextField
                      label="Asking Price"
                      type="number"
                      value={listingData.asking_price}
                      onChange={(e) =>
                        setListingData({
                          ...listingData,
                          asking_price: e.target.value,
                        })
                      }
                      size="small"
                      sx={{ 
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          backgroundColor: "#fff8f0",
                          border: "1px solid rgba(252, 196, 132, 0.3)",
                          "&:hover": {
                            borderColor: "rgba(255, 138, 80, 0.5)",
                          },
                          "&.Mui-focused": {
                            borderColor: "#ff6b35",
                            boxShadow: "0 0 0 2px rgba(255, 138, 80, 0.2)",
                          },
                        },
                      }}
                    />
                    <FormControl size="small" sx={{ 
                      minWidth: 120,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: "#fff8f0",
                        border: "1px solid rgba(252, 196, 132, 0.3)",
                        "&:hover": {
                          borderColor: "rgba(255, 138, 80, 0.5)",
                        },
                        "&.Mui-focused": {
                          borderColor: "#ff6b35",
                          boxShadow: "0 0 0 2px rgba(255, 138, 80, 0.2)",
                        },
                      },
                    }}>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={listingData.currency}
                        label="Currency"
                        onChange={(e) =>
                          setListingData({
                            ...listingData,
                            currency: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleListingSubmit}
                      size="medium"
                      sx={{
                        background: "linear-gradient(135deg, #ff8a50 0%, #ff6b35 100%)",
                        color: "white",
                        borderRadius: "10px",
                        px: 3,
                        py: 1.2,
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        "&:hover": { 
                          background: "linear-gradient(135deg, #ff6b35 0%, #ff5722 100%)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 5px 16px rgba(255, 138, 80, 0.4)",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      🚀 List in Marketplace
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate("/")}
                      size="small"
                      sx={{
                        borderColor: "rgba(252, 196, 132, 0.5)",
                        color: "#ff6b35",
                        borderRadius: "8px",
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        "&:hover": {
                          borderColor: "#ff6b35",
                          backgroundColor: "rgba(255, 138, 80, 0.1)",
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      🏠 Back to Dashboard
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Box>
  );
};

export default StubPreview;
