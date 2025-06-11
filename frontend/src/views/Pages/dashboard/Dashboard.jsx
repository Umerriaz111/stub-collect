import { Typography, Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../components/Headers/MainHeader";
import { Box } from "@mui/material";
import StubCard from "../../components/Cards/StubCard";
import { getAllListing } from "../../../core/api/marketplace";
import config from "../../../core/services/configService";

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
    <Box sx={{ p: 3 }}>
      <MainHeader />

      <Typography variant="h4" sx={{ mb: 3 }}>
        Available Stubs
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container>
        {listings.map((listing) => (
          <Grid item xs={12} sm={4} md={3} lg={3} key={listing.id}>
            <StubCard
              image={`${config.VITE_APP_API_BASE_URL}/${listing.stub.image_url}`}
              title={listing.stub.title}
              price={listing.asking_price}
              currency={listing.currency}
              onClick={() => navigate(`/marketplace/listings/${listing.id}`)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
