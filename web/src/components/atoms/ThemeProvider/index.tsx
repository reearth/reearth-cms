import { useMutation, useQuery } from "@apollo/client/react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@reearth-cms/auth";
import { Theme } from "@reearth-cms/gql/__generated__/graphql.generated";
import { GetThemeDocument, UpdateMeDocument } from "@reearth-cms/gql/__generated__/user.generated";
import { useCurrentTheme } from "@reearth-cms/state";

const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery(GetThemeDocument, { skip: !isAuthenticated });
  const [currentTheme, setCurrentTheme] = useCurrentTheme();
  const backendThemeRef = useRef<Theme | null>(null);
  const [updateMe] = useMutation(UpdateMeDocument);
  const [systemDark, setSystemDark] = useState(darkMediaQuery.matches);

  // Listen for OS preference changes
  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    darkMediaQuery.addEventListener("change", handler);
    return () => darkMediaQuery.removeEventListener("change", handler);
  }, []);

  // Sync backend → atom on initial load
  useEffect(() => {
    if (!data?.me) return;
    backendThemeRef.current = data.me.theme;
    setCurrentTheme(data.me.theme);
  }, [data, setCurrentTheme]);

  // Persist atom → backend when user changes theme
  const persistTheme = useCallback(
    (theme: Theme) => {
      if (!isAuthenticated || backendThemeRef.current === null) return;
      if (theme === backendThemeRef.current) return;
      backendThemeRef.current = theme;
      updateMe({ variables: { theme } });
    },
    [isAuthenticated, updateMe],
  );

  useEffect(() => {
    persistTheme(currentTheme);
  }, [currentTheme, persistTheme]);

  // Resolve effective dark mode
  const isDark = currentTheme === Theme.Dark || (currentTheme === Theme.Default && systemDark);

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
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}>
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
