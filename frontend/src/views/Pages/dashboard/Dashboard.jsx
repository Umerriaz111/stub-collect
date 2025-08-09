import { Typography, Grid, AppBar, Toolbar } from "@mui/material";
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

function Dashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const [isFirstSectionVisible, setIsFirstSectionVisible] = useState(true);
  const firstSectionRef = useRef(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await getAllListing();
        setListings(response.data.data);
      } catch (err) {
        setError("Failed to fetch listings");
        console.error("Error fetching listings:", err);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFirstSectionVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    if (firstSectionRef.current) {
      observer.observe(firstSectionRef.current);
    }

    return () => {
      if (firstSectionRef.current) {
        observer.unobserve(firstSectionRef.current);
      }
    };
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
        // p: 3,
        minHeight: "100vh",
        // backgroundImage:
        //   " url('https://img.freepik.com/premium-vector/music-notes-seamless-pattern-background_559319-558.jpg') , url(https://images.unsplash.com/photo-1608555307638-992062b31329?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJldHJvJTIwY29taWMlMjBvcmFuZ2UlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww)",
        // backgroundSize: "cover",
        // backgroundPosition: "center",
        // backgroundBlendMode: "multiply",
        // backgroundColor: "rgb(251 134 28)", // Bg orange main
        backgroundColor: "rgb(251 146 29)", // Bg yellowish-orange main
      }}
    >
      {/* Navbar that appears only when first section is not visible */}
      {!isFirstSectionVisible && (
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "rgb(251 134 28)",
            boxShadow: "none",
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Stub Collector
            </Typography>
            <ProfileMenu />
          </Toolbar>
        </AppBar>
      )}

      <Box sx={{ position: "relative", width: "100%" }}>
        <Box
          sx={{
            position: "absolute",
            top: 15,
            right: 15,
            m: 3,
          }}
        >
          <ProfileMenu />
        </Box>
      </Box>

      <section
        ref={firstSectionRef}
        style={{ scrollSnapAlign: "start", height: "100vh" }}
      >
        <StubUploadComponent />
      </section>

      <section
        style={{
          scrollSnapAlign: "start",
          height: "100vh",
          paddingTop: !isFirstSectionVisible ? "64px" : "0",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mt: 8,
            mb: 4,
            textAlign: "center",
            fontWeight: 800,
            color: "Black",
            textShadow:
              "-1px -1px 0 orange, 1px -1px 0 orange, -1px 1px 0 orange, 1px 1px 0 orange",
          }}
        >
          Browse Famous Event Stubs
        </Typography>

        {!isFirstSectionVisible && <Filters />}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={4} justifyContent="center">
          {listings.map((listing) => (
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
                sellerName={listing?.seller_name}
                sellerId={listing?.seller_id}
              />
            </Grid>
          ))}
        </Grid>
      </section>
    </Box>
  );
}

export default Dashboard;
