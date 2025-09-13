import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  useTheme,
  Chip,
} from "@mui/material";
import { FormatQuote as QuoteIcon } from "@mui/icons-material";

const TestimonialsSection = () => {
  const theme = useTheme();

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Concert Collector",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      content:
        "I've been collecting concert stubs for 15 years, and StubCollect finally gave me a way to organize and monetize my collection. I've already sold several rare stubs for amazing prices!",
      highlight: "Sold $3,200 worth",
      color: "#4318FF",
    },
    {
      id: 2,
      name: "Mike Rodriguez",
      role: "Sports Memorabilia Expert",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      content:
        "The verification process is incredibly thorough. As someone who's dealt with counterfeits before, I trust StubCollect to authenticate every piece in their marketplace.",
      highlight: "Verified Expert",
      color: "#10B981",
    },
    {
      id: 3,
      name: "Emily Chen",
      role: "Musical Theater Fan",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      content:
        "Found the original Phantom of the Opera stub I'd been searching for 5 years! The community here is passionate and the platform makes trading so easy.",
      highlight: "Dream Find",
      color: "#F59E0B",
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Baseball Card Collector",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      content:
        "Transitioned from card collecting to stub collecting thanks to this platform. The value tracking feature helps me make smart investment decisions.",
      highlight: "Smart Investor",
      color: "#EF4444",
    },
    {
      id: 5,
      name: "Lisa Park",
      role: "Festival Enthusiast",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      content:
        "Love how easy it is to digitize my festival wristbands and tickets. The AI recognition works perfectly, even with faded or damaged stubs!",
      highlight: "AI Lover",
      color: "#8B5CF6",
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Vintage Collector",
      avatar: "/api/placeholder/60/60",
      rating: 5,
      content:
        "Been collecting since the 70s. This platform helped me discover the true value of some rare stubs I had sitting in a box for decades.",
      highlight: "40+ Years Experience",
      color: "#06B6D4",
    },
  ];

  const featuredTestimonial = testimonials[0];
  const gridTestimonials = testimonials.slice(1);

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
            label="Testimonials"
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
            Loved by{" "}
            <Box
              component="span"
              sx={{
                background: theme.palette.gradients?.blueGradient,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Collectors
            </Box>{" "}
            Worldwide
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
            Join thousands of satisfied collectors who've transformed their
            memorabilia into digital treasures
          </Typography>
        </Box>

        {/* Featured Testimonial */}
        <Card
          sx={{
            mb: 6,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.lightBG}, white)`,
            border: `2px solid ${featuredTestimonial.color}30`,
            boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Quote decoration */}
          <Box
            sx={{
              position: "absolute",
              top: -20,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              backgroundColor: `${featuredTestimonial.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QuoteIcon
              sx={{
                fontSize: "3rem",
                color: featuredTestimonial.color,
                opacity: 0.3,
              }}
            />
          </Box>

          <CardContent sx={{ p: { xs: 4, md: 6 }, position: "relative" }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Rating
                  value={featuredTestimonial.rating}
                  readOnly
                  sx={{
                    mb: 3,
                    "& .MuiRating-iconFilled": { color: "#FFD700" },
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    lineHeight: 1.6,
                    mb: 3,
                    fontStyle: "italic",
                  }}
                >
                  "{featuredTestimonial.content}"
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: featuredTestimonial.color,
                      color: "white",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                    }}
                  >
                    {featuredTestimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {featuredTestimonial.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.light }}
                    >
                      {featuredTestimonial.role}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
                <Chip
                  label={featuredTestimonial.highlight}
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    px: 3,
                    py: 1,
                    backgroundColor: featuredTestimonial.color,
                    color: "white",
                    "& .MuiChip-label": { px: 2 },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Testimonials Grid */}
        <Grid container spacing={4}>
          {gridTestimonials.map((testimonial) => (
            <Grid item xs={12} sm={6} lg={4} key={testimonial.id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: `1px solid ${testimonial.color}20`,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
                  transition: "all 0.3s ease",
                  background: "linear-gradient(145deg, white, #fafafa)",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 16px 35px rgba(0,0,0,0.12)",
                    border: `1px solid ${testimonial.color}40`,
                    "& .quote-icon": {
                      transform: "scale(1.2) rotate(15deg)",
                      opacity: 0.6,
                    },
                  },
                }}
              >
                {/* Quote icon */}
                <QuoteIcon
                  className="quote-icon"
                  sx={{
                    position: "absolute",
                    top: 15,
                    right: 15,
                    fontSize: "2rem",
                    color: testimonial.color,
                    opacity: 0.3,
                    transition: "all 0.3s ease",
                  }}
                />

                <CardContent
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Rating
                    value={testimonial.rating}
                    readOnly
                    size="small"
                    sx={{
                      mb: 2,
                      "& .MuiRating-iconFilled": { color: "#FFD700" },
                    }}
                  />

                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.primary,
                      lineHeight: 1.6,
                      mb: 3,
                      flexGrow: 1,
                      fontStyle: "italic",
                    }}
                  >
                    "{testimonial.content}"
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: testimonial.color,
                          color: "white",
                          fontSize: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.light }}
                        >
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={testimonial.highlight}
                      size="small"
                      sx={{
                        backgroundColor: `${testimonial.color}15`,
                        color: testimonial.color,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Bottom Stats */}
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Grid container spacing={4} sx={{ maxWidth: "600px", mx: "auto" }}>
            <Grid item xs={4}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1,
                }}
              >
                4.9
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.light }}
              >
                Average Rating
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1,
                }}
              >
                98%
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.light }}
              >
                Customer Satisfaction
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1,
                }}
              >
                2.5K
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.light }}
              >
                Reviews
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;
