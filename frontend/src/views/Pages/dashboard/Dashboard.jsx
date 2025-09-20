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
import PaymentModal from "../../components/PaymentModal/PaymentModal";
import Filters from "./components/Filters";
import Chatbot from "../../components/Chatbot/Chatbot.jsx";
import Footer from "../../components/footer/Footer.jsx";
import bgImage from "../../../assets/doodles-bg.png";
import logo from "../../../assets/StubCollect_Logo/Transparent/StubCollect_Logo_Clean_100x100.png";
import notyf from "../../components/NotificationMessage/notyfInstance";

function Dashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [hasMoreListings, setHasMoreListings] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Payment-related states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStub, setSelectedStub] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  // Check for query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("showUpload") === "true") {
      setShowUpload(true);
    }
  }, []);
  // Fetch listings with optional filters
  const fetchListings = async (
    filters = {},
    currentPage = 1,
    isLoadMore = false
  ) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      }

      const response = await getAllListing({
        ...filters,
        page: currentPage,
        per_page: perPage,
      });

      if (isLoadMore) {
        // Append new listings to existing ones
        setListings((prevListings) => [...prevListings, ...response.data.data]);
      } else {
        // Replace existing listings (for new search/initial load)
        setListings(response.data.data);
      }

      // Check if there are more listings available
      if (response.data.data.length < perPage) {
        setHasMoreListings(false);
      } else {
        setHasMoreListings(true);
      }
    } catch (err) {
      setError("Failed to fetch listings");
      console.error("Error fetching listings:", err);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchListings({}, 1, false);
    setPage(1);
    setHasMoreListings(true);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings({}, nextPage, true);
  };

  const buyTicket = async (stub) => {
    if (isCreatingPayment) return; // Prevent double-clicking

    setIsCreatingPayment(true);
    setSelectedStub(stub);

    try {
      // Create payment intent
      const response = await createPaymentIntent(stub.id);

      if (response.success) {
        // Store payment data and open modal
        setPaymentData({
          clientSecret: response.clientSecret,
          paymentIntentId: response.paymentIntentId,
          orderId: response.orderId,
          liabilityShifted: response.liabilityShifted,
          payoutScheduleDays: response.payoutScheduleDays,
        });
        setPaymentModalOpen(true);

        notyf.success(
          "Payment ready! Complete your purchase in the payment form."
        );
      } else {
        // Handle payment creation errors
        if (response.sellerRequirements) {
          notyf.error(`Seller cannot accept payments: ${response.error}`);
        } else {
          notyf.error(`Payment failed: ${response.error}`);
        }
        console.error("Payment intent creation failed:", response.error);
      }
    } catch (error) {
      notyf.error("Failed to initiate payment. Please try again.");
      console.error("Error creating payment intent:", error);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = (successData) => {
    notyf.success(
      `Payment successful! Your order #${successData.orderId} has been confirmed.`
    );
    setPaymentModalOpen(false);
    setSelectedStub(null);
    setPaymentData(null);

    // Optionally refresh listings to update availability
    fetchListings({}, 1, false);
    setPage(1);
    setHasMoreListings(true);
  };

  const handlePaymentError = (error) => {
    notyf.error(`Payment failed: ${error.message || "Please try again."}`);
    console.error("Payment error:", error);
  };

  const handlePaymentModalClose = () => {
    setPaymentModalOpen(false);
    setSelectedStub(null);
    setPaymentData(null);
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
        <Grid container px={2} display={"flex"} alignItems="center">
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
          <Grid item xs={4} sx={{ textAlign: "center" }}>
            {/* <Typography
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
            </Typography> */}
            <img
              src={logo}
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
              alt="StubCollect"
            />
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
                mb: 2,
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

          {listings?.length !== 0 && <Filters onSearch={fetchListings} />}

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
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    onBuyNow={() => buyTicket(listing)}
                    isPaymentLoading={
                      isCreatingPayment && selectedStub?.id === listing.id
                    }
                    showSeller={true}
                    stub={listing.stub}
                    sellerName={listing?.seller_name}
                    sellerId={listing?.seller_id}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Load More / End of listings section */}
          {listings?.length > 0 && (
            <Box sx={{ textAlign: "center", mt: 4, mb: 4 }}>
              {hasMoreListings ? (
                <Button
                  variant="contained"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
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
                    "&:disabled": {
                      backgroundColor: "rgb(220, 155, 51)",
                      color: "rgba(0,0,0,0.6)",
                      transform: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              ) : (
                <Typography
                  variant="h6"
                  sx={{
                    color: "rgba(0,0,0,0.7)",
                    fontWeight: 600,
                    fontStyle: "italic",
                  }}
                >
                  🎉 That's all the stubs for now!
                </Typography>
              )}
            </Box>
          )}

          {/* <Footer /> */}
        </section>
      )}

      {/* Payment Modal */}
      {selectedStub && paymentData && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={handlePaymentModalClose}
          stub={{
            ...selectedStub.stub,
            asking_price: selectedStub.asking_price,
            currency: selectedStub.currency,
            id: selectedStub.id, // Add the listing ID for payment
          }}
          paymentData={paymentData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </Box>
  );
}

export default Dashboard;
