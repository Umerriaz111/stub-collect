import React from "react";
import { Box, Typography, Button, Paper, Grid } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import { useNavigate } from "react-router-dom";
import bgImage from "../../../assets/doodles-bg.png";

const StubUploadComponent = () => {
  const boxBorderRadius = "10px";
  const navigate = useNavigate();

  return (
    <Grid
      container
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "rgb(251 134 28)",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Heading , Button & Card */}

      <Grid xs={0} md={2.5}></Grid>
      <Grid
        item
        xs={12}
        md={4}
        p={2}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          minHeight: "60vh",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            mb: 5,
            color: "rgb(255, 215, 170)",
            textAlign: "center",
            fontWeight: 800,
            fontSize: "80px",
            //   textShadow: "2px 2px 0px rgba(0, 0, 0, 0.82)",
            outline: "black",
            textShadow:
              "-1px -1px 0 black, 1px -1px 0 black, -3px 3px 0 black, 1px 1px 0 black",
            letterSpacing: "0px",
          }}
          gutterBottom
        >
          Upload Your Ticket Stub
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          size="large"
          sx={{
            mt: 2,
            mb: 2,
            backgroundColor: "rgb(250, 185, 71)",
            fontWeight: "bold",
            fontSize: "24px",
            borderRadius: "30px",
            width: "50%",
            p: "0px",
            border: "2px solid black",
            color: "black",
            "&:hover": {
              backgroundColor: "rgb(240, 175, 61)",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            },
          }}
          onClick={() => navigate("/add-new-stub")}
        >
          Upload
        </Button>
      </Grid>
      <Grid
        item
        xs={6}
        md={3}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            width: "250px",
            backgroundColor: "black",
            p: "4px",
            borderRadius: boxBorderRadius,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(10deg)",
          }}
        >
          <Box
            sx={{
              backgroundColor: "rgb(28, 69, 183)",
              //   backgroundImage:
              //     "url(https://plus.unsplash.com/premium_photo-1675725088473-ea045a9e2e3a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
              borderRadius: boxBorderRadius,
              height: "300px",
              width: "100%",
              p: 2,
            }}
          >
            <Box
              sx={{
                height: "100%",
                backgroundColor: "black",
                borderRadius: boxBorderRadius,
                padding: "2px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "red",
                  borderRadius: "10px 10px 0px 0px",
                  p: 1,
                  fontWeight: "bolder",
                  textAlign: "center",
                  fontSize: "24px",
                }}
              >
                Stub Collect
              </Box>
              <Box
                sx={{
                  backgroundColor: "rgb(250, 185, 71)",
                  borderRadius: "0px 0px 10px 10px",
                  flexGrow: 1,
                  p: 1,
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <Typography variant="body1">January 31 , 2010</Typography>

                <Typography variant="h5" fontWeight={800} my={1}>
                  52nd{" "}
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  GRAMMY{" "}
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {" "}
                  Awards{" "}
                </Typography>
                <Typography>
                  <CampaignIcon sx={{ fontSize: "70px" }} />{" "}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Grid>
      <Grid xs={0} md={2.5}></Grid>

      {/* another section */}
      <Grid
        item
        xs={12}
        py={2}
        px={1}
        sx={{ backgroundColor: "rgb(251 146 29)" }}
        container
        justifyContent="center"
      >
        <Grid item xs={12} md={8}>
          <Box sx={{ width: "100%", maxWidth: "500px", m: "auto" }}>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ letterSpacing: "-0.5px" }}
            >
              How It Works
            </Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      border: "2px solid black",
                      p: 1,
                      borderRadius: "50px",
                      mr: 1,
                    }}
                  >
                    <CameraAltOutlinedIcon />
                  </Box>
                  <Typography
                    variant="body1"
                    fontWeight={800}
                    sx={{
                      letterSpacing: "-0.5px",
                      p: 1,
                      lineHeight: "1.3rem",
                    }}
                  >
                    Upload a Stub
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      border: "2px solid black",
                      p: 1,
                      borderRadius: "50px",
                      mr: 1,
                    }}
                  >
                    <SearchIcon />
                  </Box>
                  <Typography
                    variant="body1"
                    fontWeight={800}
                    sx={{
                      letterSpacing: "-0.5px",
                      p: 1,
                      lineHeight: "1.3rem",
                    }}
                  >
                    Identify the Event
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      border: "2px solid black",
                      p: 1,
                      borderRadius: "50px",
                      mr: 1,
                    }}
                  >
                    <SellOutlinedIcon />
                  </Box>
                  <Typography
                    variant="body1"
                    fontWeight={800}
                    sx={{
                      letterSpacing: "-0.5px",
                      p: 1,
                      lineHeight: "1.3rem",
                    }}
                  >
                    Sell or Browse
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default StubUploadComponent;
