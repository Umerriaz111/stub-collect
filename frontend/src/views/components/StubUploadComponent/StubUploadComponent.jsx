import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";

const StubUploadComponent = () => {
  return (
    <Box
      sx={{
        width: "80%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        p: 4,
      }}
    >
      <Box display={"flex"} gap={10}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Upload
          </Typography>

          <Typography variant="h5" component="h2" gutterBottom>
            Your Ticket Stub
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2, mb: 2 }}
          >
            Upload
          </Button>
        </Box>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            StubCollect
          </Typography>

          <Typography variant="body1" gutterBottom>
            January 31, 2010
          </Typography>

          <Typography variant="h6" gutterBottom>
            52nd GRAMMY Awards
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            backgroundColor: "red",
            borderRadius: "50%",
            height: "100px",
            width: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            How It Works
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: "center",
            backgroundColor: "red",
            borderRadius: "50%",
            height: "100px",
            width: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Upload a Stub
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: "center",
            backgroundColor: "red",
            borderRadius: "50%",
            height: "100px",
            width: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Identify the Event
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: "center",
            backgroundColor: "red",
            borderRadius: "50%",
            height: "100px",
            width: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Sell or Browse
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StubUploadComponent;
