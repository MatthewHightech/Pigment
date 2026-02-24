import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProjectsProvider } from "../hooks/ProjectsContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ProjectsProvider>
        <View className="flex-1">
          <StatusBar style="dark" />
          <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#FDFCE8" },
            animation: "slide_from_right",
          }}
        />
        </View>
      </ProjectsProvider>
    </SafeAreaProvider>
  );
}
