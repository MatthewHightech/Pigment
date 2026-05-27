import { Pressable, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/ThemeContext";
import { fontFamilies } from "../../theme";

type AppHeaderProps = {
  left?: React.ReactNode;
  right?: React.ReactNode;
  title?: string;
  showBrand?: boolean;
  style?: ViewStyle;
};

export function AppHeader({
  left,
  right,
  title,
  showBrand = true,
  style,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          paddingTop: insets.top + theme.spacing.md,
          paddingHorizontal: theme.spacing["2xl"],
          paddingBottom: theme.spacing.lg,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      <View className="flex-row items-center justify-between">
        <View className="w-12 items-start">{left}</View>
        <View className="flex-1 items-center px-2">
          {showBrand ? (
            <Text
              style={{
                fontFamily: fontFamilies.displayItalic,
                fontSize: 24,
                color: theme.colors.onBackground,
              }}
            >
              {title ?? "Pigment"}
            </Text>
          ) : title ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fontFamilies.bodyMedium,
                fontSize: 16,
                color: theme.colors.onSurface,
              }}
            >
              {title}
            </Text>
          ) : null}
        </View>
        <View className="w-12 items-end">{right}</View>
      </View>
    </View>
  );
}

type IconButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
};

export function HeaderIconButton({ onPress, children, accessibilityLabel }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <View className="p-1">{children}</View>
    </Pressable>
  );
}
