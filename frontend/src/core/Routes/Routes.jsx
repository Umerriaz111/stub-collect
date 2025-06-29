import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SET_THEME_LIGHT } from "../store/App/appSlice";
import PageWrapper from "../../views/components/PageWrapper/PageWrapper.jsx";
import { lazy } from "@loadable/component";
import SideDrawer from "../../views/components/Asides/SideDrawer.jsx";
import Login from "../../views/Pages/auth/Login.jsx";
const PageNotFound = lazy(() => import("../../views/Pages/404/PageNotFound"));

import Feed from "../../views/Pages/feed/Feed.jsx";
import Signup from "../../views/Pages/auth/Signup.jsx";
import ForgetPassword from "../../views/Pages/auth/ForgetPassword.jsx";
import NewPassword from "../../views/Pages/auth/NewPassword.jsx";
import Dashboard from "../../views/Pages/dashboard/Dashboard.jsx";
import AddNewStub from "../../views/Pages/addNewStub/AddNewStub.jsx";
import StubPreview from "../../views/Pages/stubPreview/StubPreview.jsx";
import SellerProfile from "../../views/Pages/sellerProfile/sellerProfile.jsx";
// ********************* Protected PAGES**********

// ********** EXPORT ROUTES *********
export const routes = [
  /* auth routes */
  {
    path: "/login",
    page: (
      <AuthRoute>
        <Login />
      </AuthRoute>
    ),
    header: null,
    aside: null,
  },
  {
    path: "/signup",
    page: (
      <AuthRoute>
        <Signup />
      </AuthRoute>
    ),
    header: null,
    aside: null,
  },
  {
    path: "/forget-password",
    page: (
      <AuthRoute>
        <ForgetPassword />
      </AuthRoute>
    ),
    header: null,
    aside: null,
  },
  {
    path: "/new-password",
    page: (
      <AuthRoute>
        <NewPassword />
      </AuthRoute>
    ),
    header: null,
    aside: null,
  },

  /*  All protected routes */

  {
    path: "/",
    page: <Dashboard />,
    aside: null,
  },

  {
    path: "/add-new-stub",
    page: (
      // <ProtectedRoute>
      <AddNewStub />
      // </ProtectedRoute>
    ),
    aside: null,
  },

  {
    path: "/feed",
    page: (
      // <ProtectedRoute>
      // <PageWrapper>
      <Feed />
      // </PageWrapper>
      // </ProtectedRoute>
    ),
    aside: null,
  },

  {
    path: "/seller-profile/:sellerId",
    page: (
      // <ProtectedRoute>
      // <PageWrapper>
      <SellerProfile />
      // </PageWrapper>
      // </ProtectedRoute>
    ),
    aside: null,
  },

  /* Page Not Found 404 */
  {
    path: "*",
    page: (
      // <PageWrapper isSidebar={false}>
      <PageNotFound />
      // </PageWrapper>
    ),
    header: null,
    aside: null,
  },
  {
    path: "/stub-preview/:stubId",
    page: <StubPreview />,
    aside: null,
  },
];

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state?.auth?.isAuthenticated);

  // console.log('isValid :', isValid)

  if (!isAuthenticated) {
    const redirectURL = location.pathname;
    window.localStorage.setItem("redirectURL", redirectURL);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AuthRoute({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const themeMode = useSelector((state) => state?.app?.themeMode);
  let redirectRoute = "/";

  if (themeMode === "dark") {
    dispatch(SET_THEME_LIGHT());
    console.log("themeMode is changed to light");
  }
  if (isAuthenticated) {
    const redirectURL = localStorage.getItem("redirectURL");
    localStorage.removeItem("redirectURL");
    if (redirectURL) redirectRoute = redirectURL;
  }

  return isAuthenticated ? (
    <Navigate to={`${redirectRoute}`} replace />
  ) : (
    children
  );
}
