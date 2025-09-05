import React, { useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Divider,
  Checkbox,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  useMediaQuery,
} from "@mui/material";
import FormField from "../../components/MUITextFiled/FormField";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import googleLogo from "../../../assets/google.webp";
import { useFormik } from "formik";
import AuthPageRightSide from "./AuthPageRightSide";
import notyf from "../../components/NotificationMessage/notyfInstance";
import { useDispatch } from "react-redux";
import { LOGIN } from "../../../core/store/auth/authSlice";
import * as Yup from "yup";
import { loginApi, registerUserApi } from "../../../core/api/auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevShowPassword) => !prevShowPassword);
  };

  const [loading, setLoading] = useState(false);

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("name is required"),
    email: Yup.string().required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/,
        "Password must be 8-20 characters, with uppercase, lowercase, number, special character, and no spaces"
      ),
    confirm_password: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password")], `Password confirmation doesn't match`),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: validationSchema,
    // validateOnChange: false,
    onSubmit: async (values) => {
      setLoading(true);
      console.log("values", values);

      try {
        const { confirm_password, ...data } = values;

        // Step 1: Register user
        const registerResponse = await registerUserApi(data);

        if (registerResponse?.data?.status === "success") {
          notyf.success("User Created Successfully!");

          // Step 2: Login after successful signup
          const loginResponse = await loginApi({
            email: values.email,
            password: values.password,
          });

          if (loginResponse?.data?.status === "success") {
            dispatch(LOGIN(loginResponse.data)); // Store auth state

            const redirectURL = localStorage.getItem("redirectURL") || "/";
            localStorage.removeItem("redirectURL");

            navigate(redirectURL);
            notyf.success("Login successful!");
          }
        }
      } catch (error) {
        console.log("Error Occurred", error);
        notyf.error(error.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Grid
      container
      minHeight={"100vh"}
      maxWidth={isMobile ? "100vw" : "80vw"}
      margin={"auto"}
    >
      {/* right grid item */}
      <AuthPageRightSide /> {/* :: This component is grid item */}
      {/* left grid item */}
      <Grid
        item
        xs={12}
        sm={6}
        container
        px={4}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: "500px",
            p: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.24)",
          }}
        >
          <Grid
            item
            container
            component={"form"}
            onSubmit={formik.handleSubmit}
            rowGap={2}
            py={3}
          >
            <Grid item xs={12}>
              <Typography variant="h4" fontWeight={700}>
                Create Account
              </Typography>
              <Typography variant="body3" color={"text.main"}>
                Please fill in this form to create an account !
              </Typography>
            </Grid>
            {/* Form */}
            <Grid item xs={12} container>
              <Grid item xs={12} px={1} py={"5px"}>
                <Typography variant="body3" fontWeight={"500"}>
                  Username
                  <Typography
                    component={"span"}
                    sx={{ color: "text.secondary" }}
                  >
                    *
                  </Typography>
                </Typography>
                <FormField
                  sx={{ my: "5px" }}
                  placeholder="Username"
                  id={"username"}
                  value={formik?.values?.username}
                  handleChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isTouched={formik.touched.username}
                  error={formik.errors?.username}
                />
              </Grid>
              <Grid item xs={12} px={1} py={"5px"}>
                <Typography variant="body3" fontWeight={"500"}>
                  Email
                  <Typography
                    component={"span"}
                    sx={{ color: "text.secondary" }}
                  >
                    *
                  </Typography>
                </Typography>
                <FormField
                  sx={{ my: "5px" }}
                  placeholder="john@example.com"
                  type={"email"}
                  id={"email"}
                  value={formik?.values?.email}
                  handleChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isTouched={formik.touched.email}
                  error={formik.errors?.email}
                />
                <Typography variant="body3" color={"text.main"}>
                  You can use letters, numbers & symbols
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} px={1} py={"5px"}>
                <Typography variant="body3" fontWeight={"500"}>
                  Password
                  <Typography
                    component={"span"}
                    sx={{ color: "text.secondary" }}
                  >
                    *
                  </Typography>
                </Typography>
                <FormField
                  sx={{ my: "5px" }}
                  type={showPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon fontSize="12px" />
                          ) : (
                            <VisibilityIcon fontSize="12px" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="********"
                  id={"password"}
                  value={formik?.values?.password}
                  handleChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isTouched={formik.touched.password}
                  error={formik.errors?.password}
                />
              </Grid>
              <Grid item xs={12} sm={6} px={1} py={"5px"}>
                <Typography variant="body3" fontWeight={"500"}>
                  Confirm Password
                  <Typography
                    component={"span"}
                    sx={{ color: "text.secondary" }}
                  >
                    *
                  </Typography>
                </Typography>
                <FormField
                  sx={{ my: "5px" }}
                  type={showConfirmPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOffIcon fontSize="12px" />
                          ) : (
                            <VisibilityIcon fontSize="12px" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="********"
                  id={"confirm_password"}
                  value={formik?.values?.confirm_password}
                  handleChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isTouched={formik.touched.confirm_password}
                  error={formik.errors?.confirm_password}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                sx={{ borderRadius: "16px", py: 2 }}
                disabled={loading}
              >
                <Typography variant="body3" display={"flex"}>
                  CREATE ACCOUNT {loading && <CircularProgress />}{" "}
                </Typography>
              </Button>
            </Grid>
            <Grid item xs={12} display={"flex"}>
              <Typography variant="body3">Already have an account?</Typography>
              <Typography
                variant="body3"
                component={Link}
                to={"/login"}
                px={"2px"}
                sx={{ textDecoration: "none" }}
                color={"text.secondary"}
              >
                Sign In
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Signup;
