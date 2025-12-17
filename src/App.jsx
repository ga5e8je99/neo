import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import './App.css';
import ChatBot from "./ChatBot";
import { ChatProvider, UseChatContext } from "./Context/ChatContext";
import Box from "@mui/material/Box";

// =======================
// Theme Wrapper - يتحرك داخل ChatProvider
// =======================
const ThemeWrapper = ({ children }) => {
  const { state } = UseChatContext();
  const { mode } = state;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "light" ? "#009dd2ff" : "#007bb8ff",
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1e1e1e",
          },
        },
        typography: {
          fontFamily: "Nunito",
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

// =======================
// App
// =======================
function App() {
  return (
    <ChatProvider>
      <ThemeWrapper>
        
        <ChatBot />
        {/* Background Balls */}
      <Box className="ball"></Box>
      <Box
        className="ball"
        style={{ "--delay": "-12s", "--size": "0.35", "--speed": "25s" }}
      ></Box>
      <Box
        className="ball"
        style={{ "--delay": "-10s", "--size": "0.3", "--speed": "15s" }}
      ></Box>
      </ThemeWrapper>
    </ChatProvider>
  );
}

export default App;