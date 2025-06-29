import { Typography, Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../components/Headers/MainHeader";
import { Box } from "@mui/material";
import StubCard from "../../components/Cards/StubCard";
import { getAllListing } from "../../../core/api/marketplace";
import config from "../../../core/services/configService";
import StubUploadComponent from "../../components/StubUploadComponent/StubUploadComponent";

function Dashboard() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");

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

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        backgroundImage:
          " url('https://img.freepik.com/premium-vector/music-notes-seamless-pattern-background_559319-558.jpg') , url(https://images.unsplash.com/photo-1608555307638-992062b31329?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJldHJvJTIwY29taWMlMjBvcmFuZ2UlMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "multiply",
      }}
    >
      {/* <MainHeader /> */}

      <StubUploadComponent />

      <Typography
        variant="h5"
        sx={{
          mt: 8,
          mb: 4,
          textAlign: "center",
          fontWeight: 800,
          color: "Black",
          // textShadow: "2px 2px 0px rgba(241, 240, 177, 0.82)",
          letterSpacing: "-0.5px",
          textShadow:
            "-1px -1px 0 orange, 1px -1px 0 orange, -1px 1px 0 orange, 1px 1px 0 orange",
        }}
      >
        Browse Famous Event Stubs
      </Typography>

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
              date={listing.stub.date} // Assuming you have a date field
              onClick={() => navigate(`/marketplace/listings/${listing.id}`)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
