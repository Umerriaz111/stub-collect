import { Typography, Grid, AppBar, Toolbar, Button } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../components/Headers/MainHeader";
import { Box } from "@mui/material";
import StubCard from "../../components/Cards/StubCard";
import { getAllListing } from "../../../core/api/marketplace";
import config from "../../../core/services/configService";
import StubUploadComponent from "../../components/StubUploadComponent/StubUploadComponent";
import ProfileMenu from "../../components/Headers/ProfileMenu";
import { createPaymentIntent } from "../../../core/api/paymentmethods";
import Filters from "./components/Filters";
import Chatbot from "../../components/Chatbot/Chatbot.jsx";
import Footer from "../../components/footer/Footer.jsx";
import bgImage from "../../../assets/doodles-bg.png";

function Dashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  // Check for query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("showUpload") === "true") {
      setShowUpload(true);
    }
  }, []);
  // Fetch listings with optional filters
  const fetchListings = async (filters = {}) => {
    try {
      const response = await getAllListing(filters);
      setListings(response.data.data);
    } catch (err) {
      setError("Failed to fetch listings");
      console.error("Error fetching listings:", err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const buyTicket = async (listingId) => {
    try {
      const response = await createPaymentIntent(listingId);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "rgb(251 146 29)",
      }}
    >
      <Chatbot />
      <AppBar
        position="relative"
        sx={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Grid container p={2} display={"flex"} alignItems="center">
          <Grid item xs={4}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              sx={{
                backgroundColor: "rgb(250, 185, 71)",
                fontWeight: "bold",
                fontSize: "16px",
                borderRadius: "30px",
                width: "50%",
                p: "0px",
                border: "1px solid black",
                color: "black",
              }}
              onClick={() => navigate("/add-new-stub")}
            >
              Upload
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Typography
              onClick={() => navigate("/")}
              variant="body1"
              sx={{
                color: "rgba(255, 253, 252, 1)",
                textAlign: "center",
                fontWeight: 800,
                fontSize: "30px",
                cursor: "pointer",
              }}
              gutterBottom
            >
              StubCollect
            </Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: "right" }}>
            <ProfileMenu />
          </Grid>
        </Grid>
      </AppBar>

      {/* Conditionally show StubUploadComponent if showUpload is true */}
      {showUpload && (
        <section style={{ height: "70vh" }}>
          <StubUploadComponent />
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              variant="text"
              color="primary"
              sx={{
                border: "none",
                boxShadow: "none",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "18px",
                display: "inline-flex",
                alignItems: "center",
                px: 0,
                py: 0,
                minWidth: 0,
              }}
              onClick={() => {
                navigate("/dashboard");
                setShowUpload(false);
              }}
              endIcon={
                <span style={{ display: "flex", alignItems: "center" }}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </span>
              }
            >
              Browse Listings
            </Button>
          </Box>
        </section>
      )}

      {/* Show normal dashboard if not showing upload */}
      {!showUpload && (
        <section
          style={{
            minHeight: "100vh",
            paddingTop: "30px",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              textAlign: "center",
              fontWeight: 800,
              color: "text.default",
              pt: 0,
            }}
          >
            Browse Famous Event Stubs
          </Typography>

          <Filters onSearch={fetchListings} />

          {listings?.length === 0 ? (
            <Box sx={{ margin: "auto", textAlign: "center", py: 8 }}>
              <Typography
                variant="h4"
                sx={{
                  mb: 2,
                  color: "rgba(0,0,0,0.7)",
                  fontWeight: 600,
                }}
              >
                🎫 No Stubs Available Right Now
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  color: "rgba(0,0,0,0.6)",
                  fontSize: "18px",
                  maxWidth: "500px",
                  margin: "0 auto 24px auto",
                }}
              >
                Be the first to share your memorable event stubs with the
                community! Upload your concert tickets, movie stubs, or sports
                tickets to get started.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "rgb(250, 185, 71)",
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "16px",
                  borderRadius: "30px",
                  px: 4,
                  py: 1.5,
                  border: "1px solid black",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgb(240, 175, 61)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                  },
                }}
                onClick={() => navigate("/add-new-stub")}
              >
                Upload Your First Stub
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2} justifyContent="center">
              {listings?.map((listing) => (
                <Grid
                  item
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={listing.id}
                >
                  <StubCard
                    image={`${config.VITE_APP_API_BASE_URL}/${listing.stub.image_url}`}
                    title={listing.stub.title}
                    price={listing.asking_price}
                    currency={listing.currency}
                    date={listing.stub.date}
                    onClick={() => buyTicket(listing.id)}
                    showSeller={true}
                    stub={listing.stub}
                    sellerName={listing?.seller_name}
                    sellerId={listing?.seller_id}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* <Footer /> */}
        </section>
      )}
    </Box>
  );
}

export default Dashboard;
