import React, { useState } from "react";
import {
  Grid,
  Paper,
  Box,
  Typography,
  Divider,
  Checkbox,
  Button,
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
  styled,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import FormField from "../../components/MUITextFiled/FormField";
import { Link } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../../../core/store/auth/authSlice";
import { useDispatch } from "react-redux";
import { loginApi } from "../../../core/api/auth";
import notyf from "../../components/NotificationMessage/notyfInstance";
import AuthPageRightSide from "./AuthPageRightSide";
import * as Yup from "yup";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await loginApi(values);
        if (response?.data?.status === "success") {
          dispatch(LOGIN(response.data)); // Store auth state
          const redirectURL = localStorage.getItem("redirectURL") || "/";
          localStorage.removeItem("redirectURL");
          // navigate(redirectURL);
          navigate("/");
          notyf.success("Login successful!");
        }
      } catch (error) {
        console.error("Login failed:", error);
        notyf.error(error.response.data.message || "Something went wrong");
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
      sx={{
        background:
          "linear-gradient(135deg, #FB921D 0%, #F59E0B 50%, #EAB308 100%)",
      }}
    >
      <AuthPageRightSide />
      <Grid
        item
        xs={12}
        sm={6}
        container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
        }}
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
            xs={12}
            component={"form"}
            onSubmit={formik.handleSubmit}
            container
            spacing={3}
          >
            <Grid item xs={12} textAlign={"center"}>
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
                Welcome Back!
              </Typography>
              <Typography variant="body1" color={"text.secondary"} mt={1}>
                Enter your credentials to access your account
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Email
                <Typography component={"span"} color="error">
                  *
                </Typography>
              </Typography>
              <FormField
                fullWidth
                placeholder="john@example.com"
                type={"email"}
                id={"email"}
                value={formik?.values?.email}
                handleChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isTouched={formik.touched.email}
                error={formik.errors?.email}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Password
                <Typography component={"span"} color="error">
                  *
                </Typography>
              </Typography>
              <FormField
                fullWidth
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your password"
                id={"password"}
                value={formik?.values?.password}
                handleChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isTouched={formik.touched.password}
                error={formik.errors?.password}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                size="large"
                sx={{
                  borderRadius: 3,
                  py: 1.5,
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
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </Grid>

            <Grid item xs={12} display={"flex"} justifyContent={"center"}>
              <Typography variant="body2" color="text.secondary">
                Not registered yet?{" "}
                <Link
                  to={"/signup"}
                  style={{
                    textDecoration: "none",
                    color: "#FB921D",
                    fontWeight: 600,
                  }}
                >
                  Create an Account
                </Link>
              </Typography>
            </Grid>

            {/* Privacy Policy Link */}
            <Grid item xs={12} display={"flex"} justifyContent={"center"}>
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
              >
                By signing in, you agree to our{" "}
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
    </Grid>
  );
}

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor:
          theme.palette.mode === "dark" ? "#2ECA45" : "primary.main",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));
