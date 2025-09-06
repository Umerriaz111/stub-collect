import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useMediaQuery,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  VerifiedUser as VerifyIcon,
  Storefront as MarketIcon,
  TrendingUp as GrowIcon,
} from "@mui/icons-material";

const HowItWorksSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const steps = [
    {
      icon: <UploadIcon sx={{ fontSize: "2rem", color: "white" }} />,
      title: "Upload Your Stubs",
      description:
        "Take photos of your ticket stubs or upload existing images. Our AI automatically extracts event details.",
      details:
        "Simply snap a photo with your phone or upload from your gallery. Our advanced OCR technology reads the text and identifies the event, venue, date, and other important details.",
      color: "#4318FF",
      bgColor: "#4318FF15",
    },
    {
      icon: <VerifyIcon sx={{ fontSize: "2rem", color: "white" }} />,
      title: "Get Verified",
      description:
        "Our system verifies the authenticity and completeness of your stub information for marketplace credibility.",
      details:
        "Each stub goes through our multi-step verification process including image quality check, event database matching, and authenticity verification.",
      color: "#10B981",
      bgColor: "#10B98115",
    },
    {
      icon: <MarketIcon sx={{ fontSize: "2rem", color: "white" }} />,
      title: "List on Marketplace",
      description:
        "Set your price and list verified stubs on our marketplace for collectors worldwide to discover and purchase.",
      details:
        "Create compelling listings with detailed descriptions, set competitive prices, and reach thousands of collectors looking for rare memorabilia.",
      color: "#F59E0B",
      bgColor: "#F59E0B15",
    },
    {
      icon: <GrowIcon sx={{ fontSize: "2rem", color: "white" }} />,
      title: "Grow Your Collection",
      description:
        "Track value, discover rare stubs, and build relationships with other collectors in our growing community.",
      details:
        "Monitor your collection's value over time, get alerts for rare stubs you're seeking, and connect with collectors who share your interests.",
      color: "#EF4444",
      bgColor: "#EF444415",
    },
  ];

  const DesktopStepper = () => (
    <Grid container spacing={4} alignItems="center">
      {steps.map((step, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 4,
              border: `2px solid ${step.color}20`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
              background: `linear-gradient(145deg, white, ${step.bgColor})`,
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                transform: "translateY(-12px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                border: `2px solid ${step.color}`,
                "& .step-number": {
                  transform: "scale(1.2)",
                },
                "& .step-icon": {
                  transform: "scale(1.1) rotate(10deg)",
                },
              },
            }}
          >
            {/* Step Number */}
            <Box
              className="step-number"
              sx={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: step.color,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.2rem",
                transition: "transform 0.3s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              {index + 1}
            </Box>

            <CardContent sx={{ p: 4, pt: 6 }}>
              {/* Icon */}
              <Avatar
                className="step-icon"
                sx={{
                  width: 80,
                  height: 80,
                  mb: 3,
                  backgroundColor: step.color,
                  boxShadow: `0 8px 24px ${step.color}40`,
                  transition: "transform 0.3s ease",
                }}
              >
                {step.icon}
              </Avatar>

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
                {step.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.light,
                  lineHeight: 1.6,
                  mb: 2,
                }}
              >
                {step.description}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.lightPurple,
                  lineHeight: 1.5,
                  fontSize: "0.9rem",
                }}
              >
                {step.details}
              </Typography>
            </CardContent>

            {/* Connector Arrow */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: -20,
                  transform: "translateY(-50%)",
                  width: 0,
                  height: 0,
                  borderTop: "15px solid transparent",
                  borderBottom: "15px solid transparent",
                  borderLeft: `20px solid ${step.color}`,
                  zIndex: 10,
                  display: { xs: "none", md: "block" },
                }}
              />
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const MobileStepper = () => (
    <Stepper orientation="vertical" sx={{ width: "100%" }}>
      {steps.map((step, index) => (
        <Step key={index} active={true}>
          <StepLabel
            icon={
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  backgroundColor: step.color,
                  boxShadow: `0 4px 16px ${step.color}40`,
                }}
              >
                {step.icon}
              </Avatar>
            }
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                ml: 2,
              }}
            >
              {step.title}
            </Typography>
          </StepLabel>
          <StepContent>
            <Box sx={{ ml: 2, pb: 3 }}>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.light,
                  lineHeight: 1.6,
                  mb: 2,
                }}
              >
                {step.description}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.lightPurple,
                  lineHeight: 1.5,
                }}
              >
                {step.details}
              </Typography>
            </Box>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: theme.palette.primary.lightBG,
        position: "relative",
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: theme.palette.gradients?.blueGradient,
        }}
      />

      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Chip
            label="How It Works"
            sx={{
              mb: 3,
              px: 3,
              py: 1,
              fontSize: "0.9rem",
              fontWeight: 600,
              backgroundColor: "white",
              color: theme.palette.primary.main,
              border: `1px solid ${theme.palette.primary.main}20`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
            Simple Steps to Start{" "}
            <Box
              component="span"
              sx={{
                background: theme.palette.gradients?.blueGradient,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Collecting
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
            From upload to marketplace success in just four easy steps
          </Typography>
        </Box>

        {/* Steps */}
        {isMobile ? <MobileStepper /> : <DesktopStepper />}

        {/* Bottom Stats */}
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Grid container spacing={4} sx={{ maxWidth: "800px", mx: "auto" }}>
            <Grid item xs={6} md={3}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1,
                }}
              >
                15min
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.light }}
              >
                Average Upload Time
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1,
                }}
              >
                99%
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.light }}
              >
                Verification Success
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1,
                }}
              >
                24h
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.light }}
              >
                Average Listing Time
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1,
                }}
              >
                3.2x
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.light }}
              >
                Average Value Growth
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;
