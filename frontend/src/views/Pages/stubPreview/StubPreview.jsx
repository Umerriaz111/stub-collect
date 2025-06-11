import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getStub } from "../../../core/api/stub";
import { createListing } from "../../../core/api/marketplace";
import config from "../../../core/services/configService";

const StubPreview = () => {
  const { stubId } = useParams();
  const navigate = useNavigate();
  const [stub, setStub] = useState(null);
  const [listingData, setListingData] = useState({
    asking_price: "",
    currency: "USD",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchStub = async () => {
      try {
        const response = await getStub(stubId);
        setStub(response.data.data);
      } catch (error) {
        setError("Failed to load stub details");
      }
    };
    fetchStub();
  }, [stubId]);

  const handleListingSubmit = async () => {
    try {
      setError("");
      setSuccess("");

      if (!listingData.asking_price) {
        setError("Please enter an asking price");
        return;
      }

      const response = await createListing({
        stub_id: stubId,
        ...listingData,
      });

      setSuccess("Successfully listed stub in marketplace!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create listing");
    }
  };

  if (!stub) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <Card>
        <CardMedia
          component="img"
          height="400"
          image={`${config.VITE_APP_API_BASE_URL}/${stub.image_url}`}
          // src={stub.image_path}
          alt={stub.title}
          sx={{ objectFit: "contain" }}
        />
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {stub.title}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              List in Marketplace
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label="Asking Price"
                type="number"
                value={listingData.asking_price}
                onChange={(e) =>
                  setListingData({
                    ...listingData,
                    asking_price: e.target.value,
                  })
                }
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={listingData.currency}
                  label="Currency"
                  onChange={(e) =>
                    setListingData({
                      ...listingData,
                      currency: e.target.value,
                    })
                  }
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleListingSubmit}
              >
                List in Marketplace
              </Button>
              <Button variant="outlined" onClick={() => navigate("/")}>
                Back to Dashboard
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StubPreview;
