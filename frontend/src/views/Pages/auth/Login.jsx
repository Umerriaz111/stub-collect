import React from "react";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../../../core/store/auth/authSlice";
import { useDispatch } from "react-redux";
import AuthPageRightSide from "./AuthPageRightSide";
// import { LoginComponent } from '@99Technologies-ai/login'
import config from "../../../core/services/configService";
import { handleError } from "../../../core/services/apiService";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      const loginData = await values; // Handle the Promise from LoginComponent
      if (loginData.accessToken) {
        dispatch(LOGIN(loginData));
      }
    } catch (error) {
      console.log("Login failed", error);
      handleError(error, error.response?.data?.message || "Login Failed");
    }
  };

  const registerNavigate = async (data) => {
    if (data) {
      navigate("/signup");
    }
  };

  return (
    <Grid container minHeight={"100vh"} direction={"row-reverse"}>
      {/* right grid item */}
      <AuthPageRightSide />
      {/* left grid item */}
      {/* <LoginComponent url={config.VITE_APP_AUTH_API_BASE_URL} onSubmit={handleLogin} onNavigate={registerNavigate} /> */}
      Login componenet
    </Grid>
  );
}
