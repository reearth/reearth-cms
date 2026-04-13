import { ConfigProvider, theme } from "antd";
import { useEffect } from "react";

import { useThemeMode } from "@reearth-cms/state";

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode] = useThemeMode();
  const isDark = themeMode === "dark";

  useEffect(() => {
    if (isDark) {
      document.documentElement.dataset.theme = "dark";
    } else {
      delete document.documentElement.dataset.theme;
    }
  }, [isDark]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
