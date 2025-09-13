import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import configService from "./core/services/configService.ts";
configService.loadConfig().then(() =>
  ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
  )
);
