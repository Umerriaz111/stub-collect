import { BrowserRouter } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
// @ts-ignore
import { store } from "./core/store/store";
// @ts-ignore
import { lightTheme, darkTheme } from "./core/theme/theme.jsx";
// @ts-ignore
import {
  AsideRoutes,
  PagesRoutes,
  FooterRoutes,
} from "./core/Routes/LayoutRoutes";
import { Grid } from "@mui/material";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
// @ts-ignore
import AppWrapper from "./AppWrapper.jsx";
import { useMemo } from "react";
// @ts-ignore
import { PersistGate } from "redux-persist/integration/react";
function AppContent() {
  const themeMode = useSelector((state: any) => state.app.themeMode);
  const theme = useMemo(
    () => createTheme(themeMode === "light" ? lightTheme : darkTheme),
    [themeMode]
  );
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppWrapper>
          <Grid container>
            <AsideRoutes />
            <PagesRoutes />
            <FooterRoutes />
          </Grid>
        </AppWrapper>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
