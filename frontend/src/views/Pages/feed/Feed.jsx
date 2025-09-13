import { Typography, Grid, IconButton, Button } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { SET_HEADING } from "../../../core/store/App/appSlice";
import { getUserStubs, deleteStub } from "../../../core/api/stub";
import StubCard from "../../components/Cards/StubCard";
import { Box } from "@mui/system";
import config from "../../../core/services/configService";
import { Link, useNavigate } from "react-router-dom";
import MainHeader from "../../components/Headers/MainHeader";
import ProfileMenu from "../../components/Headers/ProfileMenu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import notyf from "../../components/NotificationMessage/notyfInstance";
import { createListing } from "../../../core/api/marketplace";
import BackToMainButton from "../../components/BackToMainButton/BackToMainButton";
import Filters from "../dashboard/components/Filters";

function Feed() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stubs, setStubs] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [hasMoreStubs, setHasMoreStubs] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch stubs with optional filters
  const fetchStubs = async (
    filters = {},
    currentPage = 1,
    isLoadMore = false
  ) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      }

      const response = await getUserStubs({
        ...filters,
        page: currentPage,
        per_page: perPage,
      });

      if (isLoadMore) {
        // Append new stubs to existing ones
        setStubs((prevStubs) => [...prevStubs, ...response.data.data]);
      } else {
        // Replace existing stubs (for new search/initial load)
        setStubs(response.data.data);
      }

      // Check if there are more stubs available
      if (response.data.data.length < perPage) {
        setHasMoreStubs(false);
      } else {
        setHasMoreStubs(true);
      }
    } catch (err) {
      setError("Failed to fetch stubs");
      console.error("Error fetching stubs:", err);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchStubs({}, 1, false);
    setPage(1);
    setHasMoreStubs(true);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchStubs({}, nextPage, true);
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

  const handleDeleteStub = async (stubId) => {
    try {
      await deleteStub(stubId);
      notyf.success("Stub deleted successfully");
      // Remove the deleted stub from the state
      setStubs(stubs.filter((stub) => stub.id !== stubId));
    } catch (error) {
      console.error("Error deleting stub:", error);
      notyf.error("Failed to delete stub");
    }
  };

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
        position={{ top: 30, left: 0 }}
      />

      <Typography
        variant="h5"
        sx={{
          mb: 4,
          mt: 8,
          textAlign: "center",
          fontWeight: 800,
          color: "text.default",
        }}
      >
        My Stubs Collection
      </Typography>

      <Filters onSearch={fetchStubs} />

      {stubs?.length === 0 ? (
        <Box sx={{ margin: "auto", textAlign: "center", py: 8 }}>
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              color: "rgba(0,0,0,0.7)",
              fontWeight: 600,
            }}
          >
            🎫 No Stubs Found
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
            Start building your collection by uploading your memorable event
            stubs! Concert tickets, movie stubs, sports tickets - preserve your
            memories here.
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
          {stubs?.map((stub) => (
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
              key={stub.id}
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
          ))}
        </Grid>
      )}

      {/* Load More / End of stubs section */}
      {stubs?.length > 0 && (
        <Box sx={{ textAlign: "center", mt: 4, mb: 4 }}>
          {hasMoreStubs ? (
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
              🎉 That's all your stubs!
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

export default Feed;
