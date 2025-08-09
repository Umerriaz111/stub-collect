import React from "react";
import { Box, Container, Grid, Link, Typography } from "@mui/material";
import { Email, Facebook, Instagram, Twitter } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "rgb(251 134 28)",
        color: "darkblue",
        py: 4,
        mt: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Stub Collector
            </Typography>
            <Typography variant="body2">
              A stub collector website is a platform for enthusiasts who
              preserve ticket stubs, event passes, and other memorabilia. It
              helps users catalog their collections, trade rare stubs, and
              connect with fellow collectors. Whether it's concert tickets,
              movie stubs, or vintage transit passes, the site serves as a
              digital archive and marketplace for these nostalgic paper
              treasures.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid
            item
            xs={6}
            md={4}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0 }}>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Collections
                </Link>
              </li>
              {/* <li>
                <Link href="#" color="inherit" underline="hover">
                  Auctions
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Forum
                </Link>
              </li> */}
            </Box>
          </Grid>

          {/* Resources */}
          {/* <Grid item xs={6} md={2}>
            <Typography variant="h6" gutterBottom>
              Resources
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0 }}>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Stamp Catalog
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Valuation Guide
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Care Tips
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover">
                  Blog
                </Link>
              </li>
            </Box>
          </Grid> */}

          {/* Contact & Social */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Connect With Us
            </Typography>
            <Box sx={{ display: "flex", mb: 2 }}>
              <Email sx={{ mr: 1 }} />
              <Typography variant="body2">
                contact@stampcollector.com
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Link href="#" color="inherit">
                <Facebook />
              </Link>
              <Link href="#" color="inherit">
                <Twitter />
              </Link>
              <Link href="#" color="inherit">
                <Instagram />
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box sx={{ pt: 4, textAlign: "center" }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Stamp Collector's Corner. All rights
            reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
