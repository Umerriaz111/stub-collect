// themes.js
import { grey } from "@mui/material/colors";

export const lightTheme = {
  palette: {
    mode: "light",
    dim: {
      light: "#F2F2F2",
      main: grey[300],
      dark: grey[700],
      darker: grey[900],
    },
    text: {
      default: "black",
      primary: "#2B3674",
      secondary: "#4318FF",
      light: "#A3AED0",
      lightPurple: "#6B7192",
    },
    primary: {
      lightIcon: "#B4A3FF",
      main: "#1A237E",
      lightBG: "#F4F7FE",
      lightBGgray: "#EBEDF6",
      Highlight: "#FBFBFB",
    },
    website: {
      text1: "#343434",
      text2: "#666666",
    },
    gradients: {
      blueGradient: "linear-gradient(92.33deg, #3D4B9C 1.54%, #5369E5 97.7%)",
      lightBlueGradient:
        "linear-gradient(92.33deg, #5B6CCC 1.54%, #5369E5 97.7%)",
    },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: {
      fontSize: "96px",
      fontWeight: 300,
    },
    h2: {
      fontWeight: 300,
      fontSize: "60px",
    },
    h3: {
      fontWeight: 400,
      fontSize: "48px",
    },
    h4: {
      fontWeight: 700,
      fontSize: "30px",
    },
    h5: {
      fontWeight: 400,
      fontSize: "24px",
    },
    h6: {
      fontWeight: 600,
      fontSize: "20px",
      lineHeight: "1",
    },
    body1: {
      fontWeight: 400,
      fontSize: "16px",
    },
    body1Bold: {
      fontWeight: 500,
      fontSize: "16px",
    },
    body2: {
      fontWeight: 400,
      fontSize: "14px",
    },
    body2Bold: {
      fontWeight: 500,
      fontSize: "14px",
    },
    body3: {
      fontWeight: 400,
      fontSize: "12px",
    },
    body3Bold: {
      fontWeight: 500,
      fontSize: "12px",
    },
    headingWebsite: {
      fontWeight: 700,
      fontSize: "48px",
    },
  }
};

export const darkTheme = {
  palette: {
    mode: "dark",
    dim: {
      light: "#2F2F2F",
      main: grey[600],
      dark: grey[700],
      darker: grey[900],
    },
    text: {
      default: "white",
      primary: "#FFFFFF",
      secondary: "#4318FF",
      light: "#A3AED0",
      lightPurple: "#6B7192",
    },
    primary: {
      lightIcon: "#B4A3FF",
      main: "#4318FF",
      lightBG: "#1A1A1A",
      Highlight: "#121212",
    },
    background: {
      default: "#121212",
      // paper: '#1E1E1E',
      paper: "black",
    },
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: {
      fontSize: "96px",
      fontWeight: 300,
    },
    h2: {
      fontWeight: 300,
      fontSize: "60px",
    },
    h3: {
      fontWeight: 400,
      fontSize: "48px",
    },
    h4: {
      fontWeight: 700,
      fontSize: "30px",
    },
    h5: {
      fontWeight: 400,
      fontSize: "24px",
    },
    h6: {
      fontWeight: 600,
      fontSize: "20px",
      lineHeight: "1",
    },
    body1: {
      fontWeight: 400,
      fontSize: "16px",
    },
    body1Bold: {
      fontWeight: 500,
      fontSize: "16px",
    },
    body2: {
      fontWeight: 400,
      fontSize: "14px",
    },
    body2Bold: {
      fontWeight: 500,
      fontSize: "14px",
    },
    body3: {
      fontWeight: 400,
      fontSize: "12px",
    },
    body3Bold: {
      fontWeight: 500,
      fontSize: "12px",
    },
  },
  
};
