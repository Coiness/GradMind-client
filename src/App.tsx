import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import router from "./router";

const lightTheme = {
  token: {
    colorPrimary: "#6366f1",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#8b5cf6",
    borderRadius: 8,
  },
};

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#6366f1",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#8b5cf6",
    colorBgBase: "#1e293b",
    colorBgContainer: "#1e293b",
    colorBorder: "rgba(99, 102, 241, 0.2)",
    borderRadius: 8,
  },
};

function AppContent() {
  const { theme: currentTheme } = useTheme();
  const element = useRoutes(router);

  return (
    <ConfigProvider theme={currentTheme === "dark" ? darkTheme : lightTheme}>
      <Suspense fallback={<div>Loading Layout...</div>}>{element}</Suspense>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
