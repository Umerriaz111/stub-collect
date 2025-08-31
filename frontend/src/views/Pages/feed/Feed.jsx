import { Typography, Grid, IconButton } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { SET_HEADING } from "../../../core/store/App/appSlice";
import { getUserStubs } from "../../../core/api/stub";
import StubCard from "../../components/Cards/StubCard";
import { Box } from "@mui/system";
import config from "../../../core/services/configService";
import { Link } from "react-router-dom";
import MainHeader from "../../components/Headers/MainHeader";
import ProfileMenu from "../../components/Headers/ProfileMenu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import notyf from "../../components/NotificationMessage/notyfInstance";
import { createListing } from "../../../core/api/marketplace";
import BackToMainButton from "../../components/BackToMainButton/BackToMainButton";

function Feed() {
  const dispatch = useDispatch();
  const [stubs, setStubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStubs();
  }, []);

  const fetchStubs = async () => {
    try {
      setLoading(true);
      const response = await getUserStubs();
      setStubs(response.data.data);
    } catch (err) {
      setError(err.message || "Failed to fetch stubs");
    } finally {
      setLoading(false);
    }
  };

  const handleListingSubmit = async (data) => {
    try {
      const response = await createListing(data);

      notyf.success("listed on marketplace successfully");
    } catch (error) {
      // setError(error.response?.data?.message || "Failed to create listing");
      notyf.error("something went wrong");
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "95vh",
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

      <BackToMainButton
        backgroundColor="rgba(252, 196, 132, 0.9)"
        label="Home/My Stubs"
        hoverColor="#ff6b35"
        position={{ top: 50, left: 0 }}
      />


      <Grid container maxWidth={"80vw"} margin={"auto"} mt={4}>

        {stubs.length === 0 ? (
          <Grid item xs={12}>
            <Typography component={Link} to={"/add-new-stub"}>
              No stubs found. Create your first Stub!
            </Typography>
          </Grid>
        ) : (
          stubs?.map((stub) => (
            <Grid
              item
              xs={12}
              sm={4}
              md={3}
              key={stub.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <StubCard
                stub={stub}
                image={`${config.VITE_APP_API_BASE_URL}/${stub.image_url}`}
                title={stub.title}
                currency={stub.currency}
                link={`/stub-preview/${stub.id}`}
                ticketPrice={stub.ticket_price}
                listingStatus={stub.listing_status}
                handleListingSubmit={handleListingSubmit}
                isMyStubsPage={true}
                onEdit={(stub) => navigate(`/stub-preview/${stub.id}`)}
                onDelete={(stub) => handleDeleteStub(stub.id)}
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

export default Feed;
