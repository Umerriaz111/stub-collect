import { Typography, Grid, IconButton, Avatar, Badge } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { SET_HEADING } from "../../../core/store/App/appSlice";
import { getUserStubs } from "../../../core/api/stub";
import StubCard from "../../components/Cards/StubCard";
import { Box } from "@mui/system";
import config from "../../../core/services/configService";
import { Link, useParams } from "react-router-dom";
import MainHeader from "../../components/Headers/MainHeader";
import ProfileMenu from "../../components/Headers/ProfileMenu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getListingBySeller } from "../../../core/api/marketplace";

function SellerProfile() {
  const { sellerId } = useParams();
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    FetchSellerListing();
  }, []);

  const FetchSellerListing = async () => {
    try {
      setLoading(true);
      const response = await getListingBySeller(sellerId);
      setData(response.data.data);
    } catch (err) {
      console.log(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

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
      <Box sx={{ position: "relative", width: "100%" }}>
        <Box
          sx={{
            position: "absolute",
            top: 15,
            right: 15,
          }}
        >
          <ProfileMenu />
        </Box>
      </Box>

      <Box
        my={2}
        fontSize={20}
        component={Link}
        to={"/"}
        sx={{
          border: "2px solid",
          borderColor: "rgb(249, 194, 100)",
          display: "inline-block",
          borderRadius: 4,
          pr: 2,
          cursor: "pointer",
          textDecoration: "none",
          color: "black",
        }}
      >
        <IconButton>
          <ArrowBackIcon />
        </IconButton>{" "}
        Back to Main Screen
      </Box>

      {/* <Typography variant="h4" sx={{ mb: 3 }}>
        My Stubs
      </Typography> */}

      {/* Seller Profile Section */}
      <Grid
        container
        sx={{
          my: 4,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Grid item xs={0} md={2}></Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: "4px solid",
            borderColor: "rgb(249, 194, 100)",
            p: 2,
            borderRadius: "20px",
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            color="success"
          >
            <Avatar
              sx={{
                width: 132,
                height: 132,
                bgcolor: "red",
                color: "white",
                border: "4px solid",
                borderColor: "rgb(249, 194, 100)",
                fontSize: "64px",
                mr: 2,
              }}
            >
              {data?.seller?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
          <Box>
            <Typography
              variant="h3"
              sx={{
                textShadow:
                  "-1px -1px 0 orange, 1px -1px 0 orange, -1px 1px 0 orange, 1px 1px 0 orange",
              }}
            >
              {data?.seller?.username}
            </Typography>
            {/* <Typography variant="body2">
              {data?.seller?.member_since}
            </Typography> */}
          </Box>
        </Grid>
      </Grid>
      <Grid container>
        {data?.listings?.length === 0 ? (
          <Grid item xs={12}>
            <Typography component={Link} to={"/add-new-stub"}>
              No data found. Create your first Stub!
            </Typography>
          </Grid>
        ) : (
          data?.listings?.map((listing) => (
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
                showSeller={true}
                sellerName={listing?.seller_name}
                sellerId={listing?.seller_id}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

export default SellerProfile;
