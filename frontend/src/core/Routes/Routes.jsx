import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SET_THEME_LIGHT } from "../store/App/appSlice";
import PageWrapper from "../../views/components/PageWrapper/PageWrapper.jsx";
import { lazy } from "@loadable/component";
import SideDrawer from "../../views/components/Asides/SideDrawer.jsx";
import Login from "../../views/Pages/auth/Login.jsx";
import AuthLoadingScreen from "../../views/components/LoadingScreen/AuthLoadingScreen.jsx";
const PageNotFound = lazy(() => import("../../views/Pages/404/PageNotFound"));

import Feed from "../../views/Pages/feed/Feed.jsx";
import Signup from "../../views/Pages/auth/Signup.jsx";
import ForgetPassword from "../../views/Pages/auth/ForgetPassword.jsx";
import NewPassword from "../../views/Pages/auth/NewPassword.jsx";
import Dashboard from "../../views/Pages/dashboard/Dashboard.jsx";
import AddNewStub from "../../views/Pages/addNewStub/AddNewStub.jsx";
import StubPreview from "../../views/Pages/stubPreview/StubPreview.jsx";
import SellerProfile from "../../views/Pages/sellerProfile/SellerProfile.jsx";
import SellerOnBoarding from "../../views/Pages/sellerOnBoarding/SellerOnBoarding.jsx";
import ConnectPayments from "../../views/Pages/connectPayments/ConnectPayments.jsx";
import ConnectPaymentsCallback from "../../views/Pages/connectPaymentsCallback/ConnectPaymentsCallback.jsx";
import LandingPage from "../../views/Pages/Home/LandingPage.jsx";
import PrivacyPolicy from "../../views/Pages/privacy/PrivacyPolicy.jsx";
import TermsOfService from "../../views/Pages/privacy/TermsOfService.jsx";
import { checkAuthStatusApi } from "../api/auth.ts";
import Footer from "../../views/components/footer/Footer.jsx";
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
    footer: <Footer />,
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
    footer: <Footer />,
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

  /*  Landing page and protected routes */

  {
    path: "/",
    page: <LandingPage />,
    header: null,
    aside: null,
    footer: <Footer />,
  },

  {
    path: "/privacy-policy",
    page: <PrivacyPolicy />,
    header: null,
    aside: null,
  },

  {
    path: "/terms-of-service",
    page: <TermsOfService />,
    header: null,
    aside: null,
  },

  {
    path: "/dashboard",
    page: (
      // <ProtectedRoute>
      <Dashboard />
      // </ProtectedRoute>
    ),
    aside: null,
    footer: <Footer />,
  },

  {
    path: "/add-new-stub",
    page: (
      <ProtectedRoute>
        <PageWrapper>
          <AddNewStub />
        </PageWrapper>
      </ProtectedRoute>
    ),
    aside: null,
    footer: <Footer />,
  },

  {
    path: "/feed",
    page: (
      <ProtectedRoute>
        <Feed />
      </ProtectedRoute>
    ),
    aside: null,
    footer: <Footer />,
  },

  {
    path: "/seller-profile/:sellerId",
    page: (
      <ProtectedRoute>
        <SellerProfile />
      </ProtectedRoute>
    ),
    aside: null,
    footer: <Footer />,
  },

  {
    path: "/seller-onboarding",
    page: (
      <ProtectedRoute>
        <SellerOnBoarding />
      </ProtectedRoute>
    ),
    aside: null,
    footer: <Footer />,
  },

  {
    path: "/stub-preview/:stubId",
    page: (
      <ProtectedRoute>
        <StubPreview />
      </ProtectedRoute>
    ),
    aside: null,
    footer: <Footer />,
  },

  {
    path: "/connect-payments",
    page: (
      <ProtectedRoute>
        <ConnectPayments />
      </ProtectedRoute>
    ),
    aside: null,
    footer: <Footer />,
  },

  {
    path: "/connect-payments/callback",
    page: (
      <ProtectedRoute>
        <ConnectPaymentsCallback />
      </ProtectedRoute>
    ),
    aside: null,
    footer: <Footer />,
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
    footer: <Footer />,
  },
];

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  useEffect(() => {
    // Only check auth status if we haven't checked yet and we're not currently checking
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsCheckingAuth(true);
    try {
      const response = await checkAuthStatusApi();

      if (response?.data?.data?.is_authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Redirect to login if not authenticated
        const redirectURL = location.pathname;
        window.localStorage.setItem("redirectURL", redirectURL);
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      // Redirect to login on error
      const redirectURL = location.pathname;
      window.localStorage.setItem("redirectURL", redirectURL);
      navigate("/login", { replace: true });
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth || isAuthenticated === null) {
    return <AuthLoadingScreen />;
  }

  // If not authenticated, the redirect is handled in checkAuthStatus
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function AuthRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  useEffect(() => {
    // Only check auth status if we haven't checked yet and we're not currently checking
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsCheckingAuth(true);
    try {
      const response = await checkAuthStatusApi();

      if (response?.data?.data?.is_authenticated) {
        setIsAuthenticated(true);
        // Redirect to dashboard or saved redirect URL if authenticated
        const redirectURL = localStorage.getItem("redirectURL");
        localStorage.removeItem("redirectURL");
        const redirectRoute = redirectURL || "/dashboard";
        navigate(redirectRoute, { replace: true });
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth || isAuthenticated === null) {
    return <AuthLoadingScreen />;
  }

  // If authenticated, the redirect is handled in checkAuthStatus
  if (isAuthenticated) {
    return null;
  }

  return children;
}
