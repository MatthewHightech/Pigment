import { Pressable, Text, View } from "react-native";
import { Palette, Plus } from "lucide-react-native";
import { useTheme } from "../../hooks/ThemeContext";
import { fontFamilies } from "../../theme";

type EmptyStudioProps = {
  onAddPress: () => void;
};

export function EmptyStudio({ onAddPress }: EmptyStudioProps) {
  const { theme } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          backgroundColor: theme.colors.surfaceContainerLow,
          opacity: 0.4,
          borderTopLeftRadius: 176,
          borderTopRightRadius: 104,
          borderBottomRightRadius: 151,
          borderBottomLeftRadius: 126,
        }}
      />

      <View className="items-center" style={{ gap: theme.spacing["4xl"], maxWidth: 360 }}>
        <View style={{ position: "relative" }}>
          <View
            style={{
              width: 220,
              height: 280,
              backgroundColor: theme.colors.surfaceContainerLowest,
              borderRadius: theme.radius.lg,
              alignItems: "center",
              justifyContent: "center",
              padding: theme.spacing["2xl"],
              shadowColor: theme.colors.onSurface,
              shadowOffset: { width: 0, height: 40 },
              shadowOpacity: 0.04,
              shadowRadius: 60,
              elevation: 4,
            }}
          >
            <View
              style={{
                flex: 1,
                width: "100%",
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: `${theme.colors.outlineVariant}4D`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Palette size={56} color={`${theme.colors.outlineVariant}33`} strokeWidth={1.5} />
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              bottom: -12,
              right: -12,
              width: 220,
              height: 280,
              backgroundColor: theme.colors.surfaceContainerLow,
              borderRadius: theme.radius.lg,
              zIndex: -1,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -24,
              right: -24,
              width: 220,
              height: 280,
              backgroundColor: theme.colors.surfaceContainerHigh,
              borderRadius: theme.radius.lg,
              opacity: 0.5,
              zIndex: -2,
            }}
          />
        </View>

        <View className="items-center" style={{ gap: theme.spacing.lg }}>
          <Text
            style={{
              fontFamily: fontFamilies.displayItalic,
              fontSize: 40,
              lineHeight: 44,
              color: theme.colors.onSurface,
              textAlign: "center",
            }}
          >
            Your studio is empty.
          </Text>
          <Text
            style={{
              fontFamily: fontFamilies.label,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              maxWidth: 260,
              lineHeight: 18,
            }}
          >
            The canvas awaits your first brushstroke. Tap + to start your first project.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onAddPress}
        style={({ pressed }) => ({
          position: "absolute",
          bottom: theme.spacing["4xl"],
          right: theme.spacing["2xl"],
          width: 72,
          height: 72,
          borderTopLeftRadius: 45,
          borderTopRightRadius: 26,
          borderBottomRightRadius: 39,
          borderBottomLeftRadius: 32,
          backgroundColor: theme.colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.15,
          shadowRadius: 40,
          elevation: 6,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        })}
        accessibilityLabel="Add project"
      >
        <Plus size={32} color={theme.colors.onPrimary} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
