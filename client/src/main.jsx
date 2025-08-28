import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AppContextProvider } from "./context/AppContext.jsx";
import { TeamContextProvider } from "./context/TeamContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppContextProvider>
      <TeamContextProvider>
        <App />
      </TeamContextProvider>
    </AppContextProvider>
  </React.StrictMode>
);
