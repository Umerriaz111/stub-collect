import React from "react";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CallToActionSection from "./components/CallToActionSection";
import Footer from "./components/LandingFooter";

const LandingPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        overflowX: "hidden",
      }}
    >
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CallToActionSection />
      <Footer />
    </Box>
  );
};

export default LandingPage;
