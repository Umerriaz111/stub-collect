import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleBrowseStubs = () => {
    navigate("/dashboard");
  };

  // Mock featured stubs for display
  const featuredStubs = [
    {
      id: 1,
      title: "Super Bowl LVII",
      venue: "State Farm Stadium",
      date: "Feb 12, 2023",
      price: "$2,500",
      image: "/frontend/src/assets/landingPage/feature1.webp",
    },
    {
      id: 2,
      title: "Taylor Swift Eras Tour",
      venue: "MetLife Stadium",
      date: "May 26, 2023",
      price: "$850",
      image: "/frontend/src/assets/landingPage/feature2.webp",
    },
    {
      id: 3,
      title: "World Series Game 7",
      venue: "Minute Maid Park",
      date: "Nov 5, 2022",
      price: "$1,200",
      image: "/frontend/src/assets/landingPage/feature3.webp",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          theme.palette.gradients?.lightOrangeGradient ||
          `linear-gradient(135deg, #FED7AA 0%, #FDE68A 50%, #FEF3C7 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: `linear-gradient(45deg, ${
            theme.palette.orange?.main || "#FB921D"
          }30, ${theme.palette.orange?.dark || "#EA580C"}30)`,
          opacity: 0.4,
          display: { xs: "none", md: "block" },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          left: "5%",
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: `linear-gradient(45deg, ${
            theme.palette.orange?.dark || "#EA580C"
          }30, ${theme.palette.orange?.main || "#FB921D"}30)`,
          opacity: 0.4,
          display: { xs: "none", md: "block" },
        }}
      />

      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: 8 }}>
        <Grid
          container
          spacing={4}
          alignItems="center"
          sx={{ minHeight: "80vh" }}
        >
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                  color: theme.palette.text.primary,
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                Collect, Trade &{" "}
                <Box
                  component="span"
                  sx={{
                    background:
                      theme.palette.gradients?.warmGradient ||
                      "linear-gradient(135deg, #FB921D 0%, #DC2626 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Preserve
                </Box>{" "}
                Your Event Memories
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.light,
                  mb: 4,
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                  lineHeight: 1.6,
                  maxWidth: { md: "90%" },
                }}
              >
                Turn your ticket stubs into digital collectibles. Buy, sell, and
                trade authentic event memorabilia from concerts, sports games,
                and special events.
              </Typography>

              {/* Key Features */}
              <Box
                sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <SecurityIcon
                    sx={{ color: theme.palette.orange?.main || "#FB921D" }}
                  />
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.primary }}
                  >
                    Verified Authentic Stubs
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <TrendingUpIcon
                    sx={{ color: theme.palette.orange?.main || "#FB921D" }}
                  />
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.primary }}
                  >
                    Growing Marketplace Value
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <SpeedIcon
                    sx={{ color: theme.palette.orange?.main || "#FB921D" }}
                  />
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.primary }}
                  >
                    Instant Digital Collection
                  </Typography>
                </Box>
              </Box>

              {/* CTA Buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    borderRadius: "30px",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    background:
                      theme.palette.gradients?.warmGradient ||
                      "linear-gradient(135deg, #FB921D 0%, #DC2626 100%)",
                    boxShadow: "0 8px 25px rgba(251,146,29,0.3)",
                    "&:hover": {
                      background:
                        theme.palette.gradients?.orangeGradient ||
                        "linear-gradient(135deg, #FB921D 0%, #F59E0B 50%, #EAB308 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 35px rgba(251,146,29,0.4)",
                    },
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleBrowseStubs}
                  sx={{
                    borderRadius: "30px",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderColor: theme.palette.orange?.dark || "#EA580C",
                    color: theme.palette.orange?.dark || "#EA580C",
                    borderWidth: 2,
                    "&:hover": {
                      backgroundColor: theme.palette.orange?.dark || "#EA580C",
                      color: "white",
                      borderWidth: 2,
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(234,88,12,0.3)",
                    },
                  }}
                >
                  Browse Collection
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Right Content - Featured Stubs */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 2,
                  textAlign: "center",
                }}
              >
                Featured Collectibles
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                  width: "100%",
                  maxWidth: "500px",
                }}
              >
                {featuredStubs.map((stub, index) => (
                  <Card
                    key={stub.id}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                      background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
                      gridColumn: index === 0 ? { sm: "1 / 3" } : "auto",
                      "&:hover": {
                        transform: "translateY(-5px) scale(1.02)",
                        boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: index === 0 ? 120 : 100,
                        background: `linear-gradient(45deg, ${
                          theme.palette.orange?.main || "#FB921D"
                        }70, ${theme.palette.orange?.dark || "#EA580C"}70)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: "white",
                          fontWeight: 700,
                          textAlign: "center",
                          textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                          zIndex: 1,
                        }}
                      >
                        {stub.title}
                      </Typography>
                    </CardMedia>
                    <Box sx={{ p: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.light, mb: 0.5 }}
                      >
                        {stub.venue}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.light, mb: 1 }}
                      >
                        {stub.date}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: theme.palette.orange?.dark || "#EA580C",
                          fontWeight: 700,
                        }}
                      >
                        {stub.price}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.light,
                  textAlign: "center",
                  mt: 2,
                  fontStyle: "italic",
                }}
              >
                Join thousands of collectors worldwide
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
