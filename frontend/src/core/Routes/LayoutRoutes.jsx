import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, routes } from "./Routes";
import AsideWrapper from "../../views/components/Asides/AsideWrapper";
import { Grid, useMediaQuery } from "@mui/material";
import { useLocation, matchPath } from "react-router-dom";
// import { theme } from '../../App'
// Helper function to check if the current route has an aside
const currentRouteHasAside = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  // const currentRoute = routes.find((route) => currentPath === route.path || route.path === '*')
  const currentRoute = routes.find((route) =>
    matchPath(route.path, currentPath)
  );
  return currentRoute?.aside !== null;
};
export const AsideRoutes = () => {
  const hasAside = currentRouteHasAside();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <Grid item xs={isSmallScreen ? 0 : hasAside ? 1.6 : 0}>
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={"asideRoute-" + index}
            path={route.path}
            element={
              route?.aside ? <>{route.aside}</> : <></> //Aside wrapper
              // route?.aside ? <AsideWrapper>{route.aside}</AsideWrapper> : <></> //Aside wrapper
            }
          />
        ))}
      </Routes>
    </Grid>
  );
};

export const PagesRoutes = () => {
  const hasAside = currentRouteHasAside();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
  return (
    <Grid item xs={isSmallScreen ? 12 : hasAside ? 10.4 : 12}>
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={"pageRoute-" + index}
            path={route.path}
            element={route.page}
          />
        ))}
      </Routes>
    </Grid>
  );
};

export const HeaderRoutes = () => {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route
          key={"headerRoute-" + index}
          path={route.path}
          element={route.header || <></>}
        />
      ))}
    </Routes>
  );
};

export const FooterRoutes = () => {
  return (
    <Grid item xs={12}>
      <Routes>
        {routes.map((route, index) => (
          <Route
            key={"footerRoute-" + index}
            path={route.path}
            element={route.footer || <></>}
          />
        ))}
      </Routes>
    </Grid>
  );
};
