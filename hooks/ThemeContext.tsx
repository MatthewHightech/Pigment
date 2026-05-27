import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getTheme, type AppTheme, type ColorScheme } from "../theme";

const STORAGE_KEY = "@pigment/color-scheme";

type ThemeContextValue = {
  theme: AppTheme;
  colorScheme: ColorScheme;
  isDark: boolean;
  isReady: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme: nwScheme, setColorScheme: setNwScheme } = useNativeWindColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark") {
          setNwScheme(stored);
        }
      })
      .finally(() => setIsReady(true));
  }, [setNwScheme]);

  const colorScheme: ColorScheme = nwScheme === "dark" ? "dark" : "light";

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setNwScheme(scheme);
      AsyncStorage.setItem(STORAGE_KEY, scheme);
    },
    [setNwScheme]
  );

  const toggleColorScheme = useCallback(() => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setColorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: getTheme(colorScheme),
      colorScheme,
      isDark: colorScheme === "dark",
      isReady,
      setColorScheme,
      toggleColorScheme,
    }),
    [colorScheme, isReady, setColorScheme, toggleColorScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
