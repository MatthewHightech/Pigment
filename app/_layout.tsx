import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_600SemiBold,
} from "@expo-google-fonts/newsreader";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef } from "react";
import { ProjectsProvider } from "../hooks/ProjectsContext";
import { ThemeProvider, useTheme } from "../hooks/ThemeContext";

import "../global.css";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Unavailable during fast refresh, web, or if splash was already dismissed
});

function RootStack() {
  const { theme, isDark } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: "slide_from_right",
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  const splashHiddenRef = useRef(false);
  const [fontsLoaded, fontError] = useFonts({
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_600SemiBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  const hideSplash = useCallback(async () => {
    if (splashHiddenRef.current) return;
    try {
      await SplashScreen.hideAsync();
      splashHiddenRef.current = true;
    } catch {
      // Native splash may not be registered (fast refresh, dev client reload)
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void hideSplash();
    }
  }, [fontsLoaded, fontError, hideSplash]);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded || fontError) {
      void hideSplash();
    }
  }, [fontsLoaded, fontError, hideSplash]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ProjectsProvider>
            <RootStack />
          </ProjectsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
