import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Policy as PolicyIcon,
  ContactSupport as ContactIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, upload stubs, make purchases, or contact us for support.",
        },
        {
          subtitle: "Usage Information",
          text: "We automatically collect certain information about your use of our services, including your IP address, browser type, device information, and pages visited.",
        },
        {
          subtitle: "Payment Information",
          text: "Payment information is processed securely through Stripe and we do not store your complete payment card details on our servers.",
        },
      ],
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Provision",
          text: "To provide, maintain, and improve our stub collection and marketplace services.",
        },
        {
          subtitle: "Communication",
          text: "To send you service-related notices, updates, security alerts, and promotional messages.",
        },
        {
          subtitle: "Analytics",
          text: "To analyze usage patterns and improve our platform's functionality and user experience.",
        },
        {
          subtitle: "Legal Compliance",
          text: "To comply with legal obligations and protect our rights and the rights of our users.",
        },
      ],
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      content: [
        {
          subtitle: "Public Information",
          text: "Your username and publicly listed stubs are visible to other users on our marketplace.",
        },
        {
          subtitle: "Service Providers",
          text: "We share information with trusted third-party service providers who assist in operating our platform.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law or to protect our rights and safety.",
        },
      ],
    },
    {
      id: "data-security",
      title: "Data Security",
      content: [
        {
          subtitle: "Protection Measures",
          text: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
        },
        {
          subtitle: "Encryption",
          text: "All data transmission is encrypted using industry-standard SSL/TLS protocols.",
        },
        {
          subtitle: "Access Controls",
          text: "We limit access to personal information to employees and contractors who need it to perform their job functions.",
        },
      ],
    },
    {
      id: "your-rights",
      title: "Your Rights and Choices",
      content: [
        {
          subtitle: "Account Management",
          text: "You can update, correct, or delete your account information at any time through your account settings.",
        },
        {
          subtitle: "Data Portability",
          text: "You can request a copy of your personal data in a machine-readable format.",
        },
        {
          subtitle: "Marketing Communications",
          text: "You can opt out of promotional emails by following the unsubscribe link in any marketing email.",
        },
        {
          subtitle: "Account Deletion",
          text: "You can request deletion of your account and associated data by contacting our support team.",
        },
      ],
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 6,
            mb: 4,
            borderRadius: 4,
            background:
              "linear-gradient(135deg, #FB921D 0%, #F59E0B 50%, #EAB308 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <PolicyIcon sx={{ fontSize: "4rem", mb: 2, opacity: 0.9 }} />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem" },
              mb: 2,
            }}
          >
            Privacy Policy
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, maxWidth: "600px", mx: "auto" }}
          >
            We respect your privacy and are committed to protecting your
            personal data. This policy explains how we collect, use, and
            safeguard your information.
          </Typography>
          <Chip
            label="Last Updated: September 6, 2024"
            sx={{
              mt: 3,
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
            }}
          />
        </Paper>

        {/* Quick Navigation */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            backgroundColor: "white",
            border: `2px solid ${theme.palette.orange?.light || "#FED7AA"}`,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 3, color: theme.palette.orange?.dark }}
          >
            Quick Navigation
          </Typography>
          <Grid container spacing={2}>
            {sections.map((section, index) => (
              <Grid item xs={12} sm={6} md={4} key={section.id}>
                <Chip
                  label={section.title}
                  onClick={() =>
                    document
                      .getElementById(section.id)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  sx={{
                    width: "100%",
                    py: 2,
                    backgroundColor: theme.palette.orange?.[100] || "#FFEDD5",
                    color: theme.palette.orange?.dark || "#EA580C",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: theme.palette.orange?.[200] || "#FED7AA",
                      cursor: "pointer",
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Content Sections */}
        {sections.map((section, index) => (
          <Paper
            key={section.id}
            id={section.id}
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              backgroundColor: "white",
              border: `1px solid ${theme.palette.orange?.light || "#FED7AA"}20`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                color: theme.palette.orange?.dark || "#EA580C",
                mb: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <SecurityIcon sx={{ fontSize: "2rem" }} />
              {section.title}
            </Typography>

            <List sx={{ p: 0 }}>
              {section.content.map((item, itemIndex) => (
                <ListItem
                  key={itemIndex}
                  sx={{
                    p: 0,
                    mb: 3,
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 1,
                    }}
                  >
                    {item.subtitle}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.7,
                      pl: 0,
                    }}
                  >
                    {item.text}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        ))}

        {/* Contact Information */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, #FB921D 0%, #F59E0B 50%, #EAB308 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <ContactIcon sx={{ fontSize: "3rem", mb: 2, opacity: 0.9 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Questions About This Policy?
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, opacity: 0.9, maxWidth: "600px", mx: "auto" }}
          >
            If you have any questions about this Privacy Policy or our data
            practices, please don't hesitate to contact us.
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Email: privacy@stubcollector.com
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Phone: +1 (555) 123-4567
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
              Stub Collector, Inc. | San Francisco, CA
            </Typography>
          </Box>
        </Paper>

        {/* Back to Site */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Chip
            label="← Back to Stub Collector"
            onClick={() => navigate("/")}
            sx={{
              px: 4,
              py: 3,
              fontSize: "1rem",
              fontWeight: 600,
              backgroundColor: "white",
              color: theme.palette.orange?.main || "#FB921D",
              border: `2px solid ${theme.palette.orange?.main || "#FB921D"}`,
              "&:hover": {
                backgroundColor: theme.palette.orange?.main || "#FB921D",
                color: "white",
                cursor: "pointer",
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
