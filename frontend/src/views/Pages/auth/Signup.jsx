import React from "react";
import { Grid } from "@mui/material";
import AuthPageRightSide from "./AuthPageRightSide";
import notyf from "../../components/NotificationMessage/notyfInstance";
import { useNavigate } from "react-router-dom";
import config from "../../../core/services/configService";
import { handleError } from "../../../core/services/apiService";

const Signup = () => {
  const navigate = useNavigate();

  const loginNavigate = async (data) => {
    if (data) {
      navigate("/login");
    }
  };

  const handleRegister = async (values) => {
    try {
      const registerData = await values; // Handle the Promise from SignupComponent
      if (registerData) {
        notyf.success("Account Created Successfully!!");
        navigate("/login");
      }
    } catch (error) {
      console.log("Register failed");
      handleError(
        error,
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <Grid container minHeight={"100vh"} direction={"row-reverse"}>
      {/* right grid item */}
      <AuthPageRightSide />
      {/* left grid item */}
      {/* <RegisterComponent url={config.VITE_APP_API_BASE_URL} onSubmit={handleRegister} onNavigate={loginNavigate} /> */}
      Signup Component
    </Grid>
  );
};

export default Signup;
