import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const socialLinks = [
    { icon: <FacebookIcon />, href: "#", label: "Facebook" },
    { icon: <TwitterIcon />, href: "#", label: "Twitter" },
    { icon: <InstagramIcon />, href: "#", label: "Instagram" },
    { icon: <LinkedInIcon />, href: "#", label: "LinkedIn" },
  ];

  const footerLinks = {
    Product: [
      {
        label: "Browse Marketplace",
        action: () => handleNavigate("/dashboard"),
      },
      { label: "Upload Stubs", action: () => handleNavigate("/add-new-stub") },
      {
        label: "Seller Guide",
        action: () => handleNavigate("/seller-onboarding"),
      },
      { label: "Pricing", action: () => {} },
    ],
    Company: [
      { label: "About Us", action: () => {} },
      { label: "Careers", action: () => {} },
      { label: "Press", action: () => {} },
      { label: "Blog", action: () => {} },
    ],
    Support: [
      { label: "Help Center", action: () => {} },
      { label: "Contact Us", action: () => {} },
      { label: "Community", action: () => {} },
      { label: "API Docs", action: () => {} },
    ],
    Legal: [
      {
        label: "Privacy Policy",
        action: () => handleNavigate("/privacy-policy"),
      },
      {
        label: "Terms of Service",
        action: () => handleNavigate("/terms-of-service"),
      },
      { label: "Cookie Policy", action: () => {} },
      { label: "GDPR", action: () => {} },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.primary.main,
        color: "white",
        pt: { xs: 6, md: 8 },
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: "linear-gradient(45deg, #FFD700, #FFF)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                StubCollect
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  opacity: 0.9,
                  lineHeight: 1.6,
                  maxWidth: "300px",
                }}
              >
                The world's premier platform for collecting, trading, and
                preserving ticket stub memorabilia. Turn your memories into
                digital treasures.
              </Typography>

              {/* Contact Info */}
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon sx={{ fontSize: "1rem", opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    hello@stubcollector.com
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: "1rem", opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationIcon sx={{ fontSize: "1rem", opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    San Francisco, CA
                  </Typography>
                </Box>
              </Box>

              {/* Social Icons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.2)",
                        transform: "translateY(-2px)",
                      },
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <Grid item xs={6} sm={3} md={2} key={category}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: "1.1rem",
                }}
              >
                {category}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {links.map((link, index) => (
                  <Button
                    key={index}
                    onClick={link.action}
                    sx={{
                      color: "white",
                      textTransform: "none",
                      justifyContent: "flex-start",
                      p: 0,
                      minHeight: "auto",
                      fontSize: "0.9rem",
                      opacity: 0.8,
                      "&:hover": {
                        opacity: 1,
                        backgroundColor: "transparent",
                        textDecoration: "underline",
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Newsletter Signup */}
        {/* <Box
          sx={{
            mt: 6,
            p: 4,
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Stay Updated
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Get the latest news, rare stub alerts, and market insights delivered
            to your inbox.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              maxWidth: "400px",
              mx: "auto",
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box
              component="input"
              placeholder="Enter your email"
              sx={{
                flex: 1,
                px: 3,
                py: 1.5,
                borderRadius: "25px",
                border: "none",
                outline: "none",
                fontSize: "1rem",
                backgroundColor: "white",
                color: theme.palette.text.primary,
              }}
            />
            <Button
              variant="contained"
              sx={{
                borderRadius: "25px",
                px: 4,
                py: 1.5,
                backgroundColor: "#FFD700",
                color: theme.palette.primary.main,
                fontWeight: 700,
                "&:hover": {
                  backgroundColor: "#FFE55C",
                },
              }}
            >
              Subscribe
            </Button>
          </Box>
        </Box> */}

        <Divider sx={{ my: 4, backgroundColor: "rgba(255,255,255,0.2)" }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2024 StubCollect. All rights reserved.
          </Typography>

          <Box sx={{ display: "flex", gap: 3 }}>
            <Button
              onClick={() => {}}
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "0.9rem",
                opacity: 0.8,
                "&:hover": {
                  opacity: 1,
                  backgroundColor: "transparent",
                },
              }}
            >
              Privacy
            </Button>
            <Button
              onClick={() => {}}
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "0.9rem",
                opacity: 0.8,
                "&:hover": {
                  opacity: 1,
                  backgroundColor: "transparent",
                },
              }}
            >
              Terms
            </Button>
            <Button
              onClick={() => {}}
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "0.9rem",
                opacity: 0.8,
                "&:hover": {
                  opacity: 1,
                  backgroundColor: "transparent",
                },
              }}
            >
              Cookies
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
