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
  Switch,
  FormControlLabel,
  styled,
  CircularProgress,
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
        notyf.error(error?.message || "Login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Grid container minHeight={"100vh"}>
      {/* right grid item */}
      <AuthPageRightSide /> {/* :: This component is grid item */}
      {/* left grid item */}
      <Grid
        item
        xs={12}
        sm={7}
        container
        px={4}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Grid
          item
          xs={10}
          md={7}
          component={"form"}
          onSubmit={formik.handleSubmit}
          container
          rowGap={2}
          py={3}
        >
          <Grid item xs={12} textAlign={"center"}>
            <Typography variant="h5" fontWeight={700}>
              Welcome Back!
            </Typography>
            <Typography variant="body3" color={"text.light"}>
              Enter your email and password to sign in!
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body3" fontWeight={"500"}>
              Email
              <Typography component={"span"} sx={{ color: "text.secondary" }}>
                *
              </Typography>
            </Typography>
            <FormField
              sx={{ mt: "5px" }}
              placeholder="john@example.com"
              type={"email"}
              id={"email"}
              value={formik?.values?.email}
              handleChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isTouched={formik.touched.email}
              error={formik.errors?.email}
              // required
            />
            <Typography variant="body3" color={"text.light"}>
              You can use letters, numbers & symbols
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body3" fontWeight={"500"}>
              Password
              <Typography component={"span"} sx={{ color: "text.secondary" }}>
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
              // required
            />
            <Typography variant="body3" color={"text.light"}>
              You use 8 or more characters with a mix of letters, numbers &
              symbols
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            mt={-1}
            sx={{ display: "flex", alignItems: "center" }}
          >
            {/* <Typography variant="body3">
              <IOSSwitch
                id="keepLoggedIn"
                value={formik?.values?.keepLoggedIn}
                onChange={formik?.handleChange}
                sx={{ mx: 1 }}
              />{" "}
              Remember me
            </Typography> */}
            {/* <Checkbox
                  value={formik?.values?.keepLoggedIn}
                  id="keepLoggedIn"
                  onChange={formik?.handleChange}
                  size="small"
                  type="checkbox"
                /> */}
            {/* <Typography variant="body3">Keep me logged in</Typography> */}
            {/* <Typography
                            variant="body3"
                            component={Link}
                            to={'/forget-password'}
                            sx={{ textDecoration: 'none' }}
                            color={'text.secondary'}
                            ml={'auto'}
                            fontWeight={'500'}
                            pl={1}
                        >
                            Forget password?
                        </Typography> */}
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
                SIGN IN
                {loading && <CircularProgress />}{" "}
              </Typography>
            </Button>
          </Grid>
          <Grid item xs={12} display={"flex"}>
            <Typography variant="body3">Not registered yet?</Typography>
            <Typography
              variant="body3"
              component={Link}
              to={"/signup"}
              px={"2px"}
              sx={{ textDecoration: "none" }}
              color={"text.secondary"}
            >
              Create Account
            </Typography>
          </Grid>
        </Grid>
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
