import { Typography } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { SET_HEADING } from "../../../core/store/App/appSlice";
import { useEffect } from "react";
import { Button } from "@mui/material";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  // const dispatch = useDispatch()
  // useEffect(() => {
  //     dispatch(SET_HEADING({ heading: 'Main', subHeading: 'Dashboard' }))
  // }, [])
  const navigate = useNavigate();

  return (
    <Box display={"flex"}>
      <Box p={4}>
        <Typography variant="body1">Listings </Typography>
      </Box>
      <Box sx={{ ml: "auto", p: 1, mr: 4 }}>
        <Button variant="contained" onClick={() => navigate("/login")}>
          Login
        </Button>
        <Button onClick={() => navigate("/signup")}>Sigup</Button>
      </Box>
    </Box>
  );
}

export default Dashboard;
