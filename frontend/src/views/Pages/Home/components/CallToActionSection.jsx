import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  useTheme,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  TrendingUp as TrendingIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const CallToActionSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleStartNow = () => {
    navigate("/signup");
  };

  const handleExploreMarketplace = () => {
    navigate("/dashboard");
  };

  const benefits = [
    {
      icon: <SecurityIcon sx={{ fontSize: "2rem", color: "white" }} />,
      title: "100% Secure",
      description: "Bank-level security for all transactions",
    },
    {
      icon: <SpeedIcon sx={{ fontSize: "2rem", color: "white" }} />,
      title: "Instant Setup",
      description: "Start collecting in under 5 minutes",
    },
    {
      icon: <TrendingIcon sx={{ fontSize: "2rem", color: "white" }} />,
      title: "Growing Value",
      description: "Watch your collection appreciate over time",
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.text.secondary} 100%)`,
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          opacity: 0.5,
          display: { xs: "none", md: "block" },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          opacity: 0.5,
          display: { xs: "none", md: "block" },
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left Content */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ textAlign: { xs: "center", lg: "left" } }}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "3rem", lg: "3.5rem" },
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                Ready to Turn Your Stubs into{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#FFD700",
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  Digital Gold?
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontSize: { xs: "1.1rem", md: "1.25rem" },
                  lineHeight: 1.6,
                  maxWidth: { lg: "90%" },
                }}
              >
                Join thousands of collectors who've already digitized their
                memories and discovered the hidden value in their ticket stub
                collections.
              </Typography>

              {/* Benefits Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {benefits.map((benefit, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          background: "rgba(255,255,255,0.15)",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          backgroundColor: "rgba(255,255,255,0.2)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        {benefit.icon}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, fontSize: "1rem" }}
                        >
                          {benefit.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ opacity: 0.8, fontSize: "0.9rem" }}
                        >
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* CTA Buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartNow}
                  endIcon={<ArrowIcon />}
                  sx={{
                    borderRadius: "30px",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    backgroundColor: "#FFD700",
                    color: theme.palette.primary.main,
                    boxShadow: "0 8px 25px rgba(255,215,0,0.3)",
                    "&:hover": {
                      backgroundColor: "#FFE55C",
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 35px rgba(255,215,0,0.4)",
                    },
                  }}
                >
                  Start Collecting Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleExploreMarketplace}
                  sx={{
                    borderRadius: "30px",
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderColor: "white",
                    color: "white",
                    borderWidth: 2,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderColor: "white",
                      borderWidth: 2,
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  Explore Marketplace
                </Button>
              </Box>

              {/* Trust indicators */}
              <Box sx={{ mt: 4, opacity: 0.8 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  ✨ No credit card required • ✨ Free to start • ✨ Cancel
                  anytime
                </Typography>
                <Typography variant="body2">
                  🔒 Trusted by 10,000+ collectors worldwide
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Content - Stats Cards */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Card
                sx={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  color: "white",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: "#FFD700" }}
                      >
                        $2.1M+
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Total Trading Volume
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: "#FFD700" }}
                      >
                        50K+
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Stubs Authenticated
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card
                sx={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  color: "white",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: "#FFD700" }}
                      >
                        10K+
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Active Collectors
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 800, color: "#FFD700" }}
                      >
                        4.9★
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        User Rating
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Box
                sx={{
                  p: 4,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.1)",
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  🚀 Limited Time: Early Adopter Benefits
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Sign up now and get premium features free for your first
                  month!
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CallToActionSection;
