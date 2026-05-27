import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../hooks/ThemeContext";
import { fontFamilies } from "../../theme";

const BLOB_STYLES = [
  { width: 88, height: 88, radii: [0.6, 0.4, 0.3, 0.7] as const },
  { width: 96, height: 96, radii: [0.3, 0.6, 0.7, 0.4] as const },
  { width: 72, height: 72, radii: [0.4, 0.6, 0.4, 0.6] as const },
  { width: 88, height: 88, radii: [0.3, 0.6, 0.7, 0.4] as const, offsetX: 12 },
  { width: 104, height: 104, radii: [0.6, 0.4, 0.3, 0.7] as const, offsetY: -8 },
] as const;

function blobBorderRadius(radii: readonly [number, number, number, number], size: number) {
  const [tl, tr, br, bl] = radii;
  return {
    borderTopLeftRadius: size * tl,
    borderTopRightRadius: size * tr,
    borderBottomRightRadius: size * br,
    borderBottomLeftRadius: size * bl,
  };
}

type PaletteSwatchProps = {
  hex: string;
  index: number;
  onPress: () => void;
};

export function PaletteSwatch({ hex, index, onPress }: PaletteSwatchProps) {
  const { theme } = useTheme();
  const blob = BLOB_STYLES[index % BLOB_STYLES.length];
  const size = Math.max(blob.width, blob.height);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        transform: [
          { translateX: "offsetX" in blob ? blob.offsetX : 0 },
          { translateY: "offsetY" in blob ? blob.offsetY : 0 },
          { scale: pressed ? 1.05 : 1 },
        ],
      })}
    >
      <View
        style={{
          width: blob.width,
          height: blob.height,
          backgroundColor: hex,
          ...blobBorderRadius(blob.radii, size),
          shadowColor: hex,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 4,
        }}
      />
      <Text
        style={{
          marginTop: theme.spacing.md,
          fontFamily: fontFamilies.label,
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          color: theme.colors.onSurfaceVariant,
        }}
      >
        {hex.toUpperCase()}
      </Text>
    </Pressable>
  );
}

type PaletteGridProps = {
  colors: { id: number; hexValue: string }[];
  onColorPress: (color: { id: number; hexValue: string }) => void;
};

export function PaletteGrid({ colors, onColorPress }: PaletteGridProps) {
  const { theme } = useTheme();

  if (colors.length === 0) {
    return (
      <Text
        style={{
          fontFamily: fontFamilies.body,
          fontSize: 14,
          color: theme.colors.onSurfaceVariant,
          lineHeight: 22,
        }}
      >
        Press and hold on the canvas above to extract your first pigment.
      </Text>
    );
  }

  return (
    <View className="flex-row flex-wrap" style={{ gap: theme.spacing["2xl"] }}>
      {colors.map((color, index) => (
        <PaletteSwatch
          key={color.id}
          hex={color.hexValue}
          index={index}
          onPress={() => onColorPress(color)}
        />
      ))}
    </View>
  );
}
