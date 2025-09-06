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
      px={isMobile ? 0 : 40}
      margin={"auto"}
      sx={{
        background:
          "linear-gradient(135deg, #FB921D 0%, #F59E0B 50%, #EAB308 100%)",
      }}
    >
      {/* right grid item */}
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
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
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
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background:
                    "linear-gradient(135deg, #FB921D 0%, #DC2626 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Create Account
              </Typography>
              <Typography variant="body1" color={"text.secondary"}>
                Please fill in this form to create an account!
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
                sx={{
                  borderRadius: 3,
                  py: 2,
                  background:
                    "linear-gradient(135deg, #FB921D 0%, #DC2626 100%)",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #FB921D 0%, #F59E0B 50%, #EAB308 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 25px rgba(251,146,29,0.3)",
                  },
                }}
                disabled={loading}
              >
                <Typography
                  variant="body1"
                  display={"flex"}
                  alignItems={"center"}
                  gap={1}
                >
                  CREATE ACCOUNT{" "}
                  {loading && <CircularProgress size={20} color="inherit" />}
                </Typography>
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              display={"flex"}
              flexDirection={"column"}
              gap={1}
            >
              <Box display={"flex"} justifyContent={"center"}>
                <Typography variant="body2">
                  Already have an account?
                </Typography>
                <Typography
                  variant="body2"
                  component={Link}
                  to={"/login"}
                  px={"4px"}
                  sx={{ textDecoration: "none", fontWeight: 600 }}
                  color={"#FB921D"}
                >
                  Sign In
                </Typography>
              </Box>

              {/* Privacy Policy */}
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 2 }}
              >
                By creating an account, you agree to our{" "}
                <Link
                  to={"/privacy-policy"}
                  style={{
                    textDecoration: "none",
                    color: "#FB921D",
                    fontWeight: 500,
                  }}
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  to={"/terms"}
                  style={{
                    textDecoration: "none",
                    color: "#FB921D",
                    fontWeight: 500,
                  }}
                >
                  Terms of Service
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      {/* left grid item */}
      <AuthPageRightSide /> {/* :: This component is grid item */}
    </Grid>
  );
};

export default Signup;
