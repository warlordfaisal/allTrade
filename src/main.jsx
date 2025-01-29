import React from "react";
import ReactDOM from "react-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Create a custom theme (optional)
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue color
    },
    secondary: {
      main: "#dc004e", // Pink color
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
