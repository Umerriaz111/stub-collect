import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  Chip,
} from "@mui/material";
import {
  PhotoCamera as CameraIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";

const FeaturesSection = () => {
  const theme = useTheme();

  const features = [
    {
      icon: (
        <CameraIcon
          sx={{ fontSize: "3rem", color: theme.palette.primary.main }}
        />
      ),
      title: "Smart Digitization",
      description:
        "Upload photos of your ticket stubs and our AI automatically extracts event details, dates, and venue information.",
      highlight: "AI-Powered",
      color: "#4318FF",
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: "3rem", color: "#10B981" }} />,
      title: "Authenticity Verified",
      description:
        "Every stub goes through our verification process to ensure authenticity and prevent counterfeits in the marketplace.",
      highlight: "100% Verified",
      color: "#10B981",
    },
    {
      icon: <VerifiedIcon sx={{ fontSize: "3rem", color: "#F59E0B" }} />,
      title: "Trade & Sell",
      description:
        "Connect with collectors worldwide to buy, sell, or trade rare event memorabilia through our secure marketplace.",
      highlight: "Global Market",
      color: "#F59E0B",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: "3rem", color: "#EF4444" }} />,
      title: "Secure Transactions",
      description:
        "Protected payments with Stripe integration, buyer protection, and seller verification for safe transactions.",
      highlight: "Stripe Secured",
      color: "#EF4444",
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: "3rem", color: "#8B5CF6" }} />,
      title: "Value Tracking",
      description:
        "Track the market value of your collection over time and get insights on trending events and collectibles.",
      highlight: "Price Analytics",
      color: "#8B5CF6",
    },
    {
      icon: <TrendingIcon sx={{ fontSize: "3rem", color: "#06B6D4" }} />,
      title: "Collection Growth",
      description:
        "Build your digital collection, showcase rare finds, and connect with other collectors who share your passion.",
      highlight: "Community",
      color: "#06B6D4",
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: theme.palette.background.default,
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Chip
            label="Features"
            sx={{
              mb: 3,
              px: 3,
              py: 1,
              fontSize: "0.9rem",
              fontWeight: 600,
              backgroundColor: theme.palette.primary.lightBG,
              color: theme.palette.primary.main,
              border: `1px solid ${theme.palette.primary.main}20`,
            }}
          />
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              mb: 3,
              fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem" },
            }}
          >
            Why Choose{" "}
            <Box
              component="span"
              sx={{
                background: theme.palette.gradients?.blueGradient,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Stub Collector
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.light,
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Everything you need to digitize, authenticate, and monetize your
            event memorabilia collection
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  background: "linear-gradient(145deg, #ffffff, #fafafa)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    "& .feature-icon": {
                      transform: "scale(1.1) rotate(5deg)",
                    },
                    "& .feature-highlight": {
                      transform: "translateX(0)",
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* Background decoration */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: `${feature.color}10`,
                    opacity: 0.5,
                  }}
                />

                <CardContent
                  sx={{
                    p: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Icon */}
                  <Box
                    className="feature-icon"
                    sx={{
                      mb: 3,
                      transition: "transform 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {feature.icon}
                    <Chip
                      label={feature.highlight}
                      className="feature-highlight"
                      size="small"
                      sx={{
                        backgroundColor: `${feature.color}15`,
                        color: feature.color,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        transform: "translateX(20px)",
                        opacity: 0,
                        transition: "all 0.3s ease",
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      mb: 2,
                    }}
                  >
                    {feature.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.light,
                      lineHeight: 1.6,
                      flexGrow: 1,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Bottom CTA */}
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.primary,
              mb: 2,
              fontWeight: 600,
            }}
          >
            Ready to start your collection?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.light,
              mb: 3,
            }}
          >
            Join over 10,000+ collectors who trust Stub Collector with their
            memorabilia
          </Typography>

          {/* Stats */}
          <Grid container spacing={4} sx={{ maxWidth: "500px", mx: "auto" }}>
            <Grid item xs={4}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                10K+
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.light }}
              >
                Collectors
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                50K+
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.light }}
              >
                Stubs Listed
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                $2M+
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.light }}
              >
                Traded Value
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
