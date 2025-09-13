import React from "react";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import TestimonialsSection from "./components/TestimonialsSection";
import CallToActionSection from "./components/CallToActionSection";

const LandingPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#FB921D", // Orange background like body
        overflowX: "hidden",
      }}
    >
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      {/* <TestimonialsSection /> */}
      <CallToActionSection />
    </Box>
  );
};

export default LandingPage;
