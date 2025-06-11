import {
  Button,
  Grid,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  Tooltip,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/system";
import { useSelector, useDispatch } from "react-redux";
import { ArrowBackIos, CloudUpload } from "@mui/icons-material";
import { TOGGLE_SIDEBAR } from "../../../core/store/App/appSlice";
import ProfileMenu from "./ProfileMenu";

export default function MainHeader() {
  const { heading } = useSelector((state) => state.app);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const handleToggle = () => {
    dispatch(TOGGLE_SIDEBAR());
  };

  return (
    <AppBar color="default" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 70 } }}>
          <Grid container spacing={2} alignItems="center">
            {/* Left section with logo and upload button */}
            <Grid
              item
              xs={12}
              md={7}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={() => navigate("/add-new-stub")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  ml: { xs: "auto", md: 2 },
                }}
              >
                Upload Stub
              </Button>

              <Typography
                variant="h6"
                component="div"
                sx={{
                  flexGrow: 0,
                  fontWeight: 600,
                  color: "text.primary",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Stub Collector
              </Typography>
            </Grid>

            {/* Right section with profile menu */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                order: { xs: -1, md: 0 },
              }}
            >
              <ProfileMenu />
            </Grid>
          </Grid>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
const IconBtnStyle = {
  padding: "0",
  marginX: "12px",
};
