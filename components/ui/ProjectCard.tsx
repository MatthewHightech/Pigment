import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { ImageOff } from "lucide-react-native";
import { useProjectColors } from "../../hooks/useProjectColors";
import { useTheme } from "../../hooks/ThemeContext";
import { fontFamilies } from "../../theme";

const PLACEHOLDER_URI = "missing";
const MAX_SWATCHES = 5;

type ProjectCardProps = {
  id: number;
  name: string;
  imageUri: string;
  cellSize: number;
  onPress: () => void;
  onLongPress: () => void;
};

export function ProjectCard({
  id,
  name,
  imageUri,
  cellSize,
  onPress,
  onLongPress,
}: ProjectCardProps) {
  const { theme } = useTheme();
  const isMissing = imageUri === PLACEHOLDER_URI || !imageUri;
  const { colors: paletteColors } = useProjectColors(id);
  const swatchHexes = paletteColors.slice(0, MAX_SWATCHES).map((c) => c.hexValue);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        width: cellSize,
        opacity: pressed ? 0.95 : 1,
      })}
    >
      <View
        style={{
          width: cellSize,
          height: cellSize,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.surfaceContainerLow,
          overflow: "hidden",
        }}
      >
        {isMissing ? (
          <View
            className="flex-1 items-center justify-center"
            style={{ backgroundColor: theme.colors.surfaceContainer }}
          >
            <ImageOff size={36} color={theme.colors.onSurfaceVariant} />
            <Text
              style={{
                fontFamily: fontFamilies.label,
                fontSize: 10,
                letterSpacing: 1,
                color: theme.colors.onSurfaceVariant,
                marginTop: theme.spacing.sm,
                textTransform: "uppercase",
              }}
            >
              Missing image
            </Text>
          </View>
        ) : (
          <Image source={{ uri: imageUri }} style={{ width: cellSize, height: cellSize }} contentFit="cover" />
        )}
      </View>

      <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fontFamilies.displayItalic,
            fontSize: 20,
            color: theme.colors.onSurface,
          }}
        >
          {name}
        </Text>
        {swatchHexes.length > 0 && (
          <View className="flex-row items-center" style={{ gap: theme.spacing.sm }}>
            {swatchHexes.map((hex) => (
              <View
                key={hex}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: theme.radius.full,
                  backgroundColor: hex,
                  borderWidth: 1,
                  borderColor: `${theme.colors.outlineVariant}4D`,
                }}
              />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}
