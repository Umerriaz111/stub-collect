import { Typography, Grid } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { SET_HEADING } from "../../../core/store/App/appSlice";
import { getUserStubs } from "../../../core/api/stub";
import StubCard from "../../components/Cards/StubCard";
import { Box } from "@mui/system";
import config from "../../../core/services/configService";
import { Link } from "react-router-dom";
import MainHeader from "../../components/Headers/MainHeader";

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
    <Box p={3} pt={12}>
      <MainHeader />

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
