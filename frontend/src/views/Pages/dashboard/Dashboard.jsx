import { Typography } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SET_HEADING } from "../../../core/store/App/appSlice";
import { useEffect } from "react";
import { Button } from "@mui/material";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MainHeader from "../../components/Headers/MainHeader";

function Dashboard() {
  // const dispatch = useDispatch()
  // useEffect(() => {
  //     dispatch(SET_HEADING({ heading: 'Main', subHeading: 'Dashboard' }))
  // }, [])
  const navigate = useNavigate();

  const username = useSelector((state) => state.auth.user);

  return (
    <Box display={"flex"} p={2}>
      <MainHeader />
      {/* <Box>
        <Button variant="contained" onClick={() => navigate("/add-new-stub")}>
          {" "}
          Upload New Stub
        </Button>
      </Box>
      <Box sx={{ ml: "auto" }}>
        <Button variant="contained" onClick={() => navigate("/login")}>
          Login
        </Button>
        <Button onClick={() => navigate("/signup")}>Sigup</Button>
      </Box> */}
    </Box>
  );
}

export default Dashboard;
