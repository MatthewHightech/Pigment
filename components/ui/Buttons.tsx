import { Pressable, Text, type ViewStyle } from "react-native";
import { useTheme } from "../../hooks/ThemeContext";
import { fontFamilies } from "../../theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
};

export function PrimaryButton({ label, onPress, disabled, style, icon }: PrimaryButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing["2xl"],
          borderRadius: theme.radius.full,
          backgroundColor: disabled ? theme.colors.surfaceContainerHighest : theme.colors.primary,
          opacity: disabled ? 0.6 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: disabled ? 0 : 0.2,
          shadowRadius: 24,
          elevation: disabled ? 0 : 4,
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={{
          fontFamily: fontFamilies.label,
          fontSize: 12,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          fontWeight: "700",
          color: theme.colors.onPrimary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export function SecondaryButton({ label, onPress, style }: SecondaryButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surfaceContainerHighest,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: fontFamilies.bodyMedium,
          fontSize: 16,
          color: theme.colors.onSurface,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type DestructiveTextButtonProps = {
  label: string;
  onPress: () => void;
};

export function DestructiveTextButton({ label, onPress }: DestructiveTextButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        paddingVertical: theme.spacing.lg,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: fontFamilies.label,
          fontSize: 12,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: theme.colors.destructive,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
