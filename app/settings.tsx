import { View, Text, Switch, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft, Moon, Sun } from "lucide-react-native";
import { useTheme } from "../hooks/ThemeContext";
import { fontFamilies } from "../theme";

import "../global.css";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark, setColorScheme } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View
        style={{
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing["2xl"],
          paddingBottom: theme.spacing.lg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.sm,
            opacity: pressed ? 0.7 : 1,
          })}
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={22} color={theme.colors.primary} />
          <Text
            style={{
              fontFamily: fontFamilies.label,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: theme.colors.primary,
            }}
          >
            Back
          </Text>
        </Pressable>
        <Text
          style={{
            fontFamily: fontFamilies.displayItalic,
            fontSize: 24,
            color: theme.colors.onBackground,
          }}
        >
          Settings
        </Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing["2xl"],
          paddingBottom: insets.bottom + theme.spacing["5xl"],
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surfaceContainerLow,
            borderRadius: theme.radius["2xl"],
            padding: theme.spacing["2xl"],
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              fontFamily: fontFamilies.label,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: theme.colors.onSurfaceVariant,
              marginBottom: theme.spacing.lg,
            }}
          >
            Appearance
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.md,
            }}
          >
            <View
              style={{
                flex: 1,
                flexShrink: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.md,
                minWidth: 0,
              }}
            >
              {isDark ? (
                <Moon size={20} color={theme.colors.primary} />
              ) : (
                <Sun size={20} color={theme.colors.primary} />
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontFamily: fontFamilies.bodyMedium,
                    fontSize: 16,
                    color: theme.colors.onSurface,
                  }}
                >
                  Dark mode
                </Text>
                <Text
                  style={{
                    fontFamily: fontFamilies.body,
                    fontSize: 13,
                    color: theme.colors.onSurfaceVariant,
                    marginTop: 2,
                  }}
                >
                  Studio lighting for low-light environments
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={(value) => setColorScheme(value ? "dark" : "light")}
              trackColor={{
                false: theme.colors.surfaceContainerHighest,
                true: theme.colors.primaryContainer,
              }}
              thumbColor={theme.colors.surfaceContainerLowest}
              style={{ flexShrink: 0 }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
