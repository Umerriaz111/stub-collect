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

      <Typography variant="h4" sx={{ mb: 3 }}>
        My Stubs
      </Typography>
      <Grid container>
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
              />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

export default Feed;
