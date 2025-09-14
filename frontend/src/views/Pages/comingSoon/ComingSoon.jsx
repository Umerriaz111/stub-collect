import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Construction as ConstructionIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const ComingSoon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      "/about": "About Us",
      "/careers": "Careers",
      "/press": "Press",
      "/blog": "Blog",
      "/help": "Help Center",
      "/contact": "Contact Us",
      "/community": "Community",
      "/api-docs": "API Documentation",
      "/privacy-policy": "Privacy Policy",
      "/terms-of-service": "Terms of Service",
      "/cookie-policy": "Cookie Policy",
      "/gdpr": "GDPR Information",
      "/pricing": "Pricing",
    };
    return titles[path] || "Page";
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Removed notify functionality as it's not available

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: "flex",
        alignItems: "center",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Card
          sx={{
            textAlign: "center",
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent>
            {/* Construction Icon */}
            <Box sx={{ mb: 4 }}>
              <ConstructionIcon
                sx={{
                  fontSize: { xs: "4rem", md: "5rem" },
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              />
            </Box>

            {/* Main Content */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                color: theme.palette.text.primary,
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              {getPageTitle()}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 3,
                color: theme.palette.primary.main,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              Coming Soon!
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: theme.palette.text.secondary,
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.6,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              We're working hard to bring you an amazing experience on this
              page. Our team is crafting something special that will enhance
              your StubCollect journey. Stay tuned for updates!
              <br />
              <br />
              You can stay connected with us on social media for the latest
              updates and announcements.
            </Typography>

            {/* Features Preview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <ScheduleIcon
                    sx={{
                      fontSize: "2.5rem",
                      color: theme.palette.primary.main,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Coming Soon
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This page is under active development
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <NotificationsIcon
                    sx={{
                      fontSize: "2.5rem",
                      color: theme.palette.primary.main,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Get Notified
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Be the first to know when it's ready
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: "center", p: 2 }}>
                  <EmailIcon
                    sx={{
                      fontSize: "2.5rem",
                      color: theme.palette.primary.main,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Stay Connected
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Follow us on social media for updates
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleGoHome}
                startIcon={<HomeIcon />}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Go to Homepage
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={handleGoBack}
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                    color: "white",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Go Back
              </Button>
            </Box>

            {/* Contact Info */}
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Have questions or suggestions?
              </Typography>
              <Typography variant="body2">
                <Box
                  component="a"
                  href="mailto:support@stubcollect.com"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 600,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Contact us at support@stubcollect.com
                </Box>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ComingSoon;
