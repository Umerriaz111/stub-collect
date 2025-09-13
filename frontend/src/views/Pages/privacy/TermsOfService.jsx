import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  List,
  ListItem,
  useTheme,
} from "@mui/material";
import {
  Gavel as GavelIcon,
  ContactSupport as ContactIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      content: [
        "By accessing and using StubCollect, you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to abide by the above, please do not use this service.",
        "These terms may be updated from time to time, and continued use constitutes acceptance of any changes.",
      ],
    },
    {
      id: "description",
      title: "Service Description",
      content: [
        "StubCollect is a digital platform for collecting, trading, and selling ticket stub memorabilia.",
        "We provide tools for digitizing physical ticket stubs using AI-powered recognition technology.",
        "Our marketplace facilitates secure transactions between collectors worldwide.",
        "We offer authentication services to verify the legitimacy of listed items.",
      ],
    },
    {
      id: "user-accounts",
      title: "User Accounts",
      content: [
        "You must create an account to use certain features of our service.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You agree to provide accurate, current, and complete information during registration.",
        "You must notify us immediately of any unauthorized use of your account.",
        "We reserve the right to suspend or terminate accounts that violate these terms.",
      ],
    },
    {
      id: "marketplace-rules",
      title: "Marketplace Rules",
      content: [
        "All listings must be for authentic ticket stubs and related memorabilia.",
        "Sellers are responsible for accurately describing their items and providing clear photos.",
        "Prohibited items include counterfeit stubs, reproductions, and items obtained illegally.",
        "We reserve the right to remove listings that violate our policies.",
        "Transactions are facilitated through our secure payment system powered by Stripe.",
      ],
    },
    {
      id: "payments",
      title: "Payments and Fees",
      content: [
        "We charge a platform fee of 10% on successful sales.",
        "Payment processing is handled securely through Stripe.",
        "Sellers are responsible for applicable taxes on their sales.",
        "Refunds may be issued in cases of significantly misrepresented items.",
        "Chargebacks and disputes are handled according to our seller liability policy.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      content: [
        "Users retain ownership of content they upload to the platform.",
        "By uploading content, you grant us a license to use it in connection with our services.",
        "You may not use our platform to infringe on the intellectual property rights of others.",
        "We respect intellectual property rights and will respond to valid takedown requests.",
        "Our platform name, logo, and design are protected trademarks.",
      ],
    },
    {
      id: "prohibited-conduct",
      title: "Prohibited Conduct",
      content: [
        "Using the platform for any illegal or unauthorized purpose.",
        "Attempting to gain unauthorized access to our systems.",
        "Interfering with or disrupting the platform or servers.",
        "Harassing, threatening, or defrauding other users.",
        "Creating multiple accounts to circumvent restrictions.",
        "Posting spam, malware, or malicious content.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers and Limitations",
      content: [
        'Our service is provided "as is" without warranties of any kind.',
        "We do not guarantee the accuracy of AI-generated stub information.",
        "We are not responsible for disputes between buyers and sellers.",
        "Our liability is limited to the maximum extent permitted by law.",
        "We do not warrant that the service will be uninterrupted or error-free.",
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
          <GavelIcon sx={{ fontSize: "4rem", mb: 2, opacity: 0.9 }} />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem" },
              mb: 2,
            }}
          >
            Terms of Service
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, maxWidth: "600px", mx: "auto" }}
          >
            These terms govern your use of StubCollect and outline the rights
            and responsibilities of all users on our platform.
          </Typography>
          <Chip
            label="Effective Date: September 6, 2024"
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
              <AssignmentIcon sx={{ fontSize: "2rem" }} />
              {section.title}
            </Typography>

            <List sx={{ p: 0 }}>
              {section.content.map((item, itemIndex) => (
                <ListItem
                  key={itemIndex}
                  sx={{
                    p: 0,
                    mb: 2,
                    display: "list-item",
                    listStyleType: "disc",
                    ml: 3,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.7,
                    }}
                  >
                    {item}
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
            Questions About These Terms?
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, opacity: 0.9, maxWidth: "600px", mx: "auto" }}
          >
            If you have any questions about these Terms of Service or need
            clarification on any policies, please contact us.
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
              Email: legal@stubcollector.com
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Phone: +1 (555) 123-4567
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 2 }}>
              StubCollect, Inc. | San Francisco, CA
            </Typography>
          </Box>
        </Paper>

        {/* Back to Site */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Chip
            label="← Back to StubCollect"
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

export default TermsOfService;
