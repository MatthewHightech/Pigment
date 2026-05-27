import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  PanResponder,
  Image,
  Alert,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import { samplePixelColor } from "../lib/colorSampler";
import { hexToHsl } from "../lib/colorUtils";
import { useTheme } from "../hooks/ThemeContext";
import { fontFamilies } from "../theme";

const LOUPE_SIZE = 256;
const LOUPE_ZOOM = 1;
const CROSSHAIR_R = 6;

export interface ColorPickerOverlayProps {
  visible: boolean;
  imageUri: string;
  imageWidth: number;
  imageHeight: number;
  initialPixel: { x: number; y: number };
  onConfirm: (hex: string) => void;
  onCancel: () => void;
}

function clampPixel(
  x: number,
  y: number,
  imgW: number,
  imgH: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(imgW - 1, x)),
    y: Math.max(0, Math.min(imgH - 1, y)),
  };
}

export function ColorPickerOverlay({
  visible,
  imageUri,
  imageWidth,
  imageHeight,
  initialPixel,
  onConfirm,
  onCancel,
}: ColorPickerOverlayProps) {
  const insets = useSafeAreaInsets();
  const { theme, colorScheme } = useTheme();
  const ctaBackground =
    colorScheme === "dark" ? theme.colors.primary : theme.colors.onSurface;
  const [pixel, setPixel] = useState(() =>
    clampPixel(initialPixel.x, initialPixel.y, imageWidth, imageHeight)
  );
  const [previewHex, setPreviewHex] = useState("#823B18");
  const [isSampling, setIsSampling] = useState(false);

  const pixelRef = useRef(pixel);
  pixelRef.current = pixel;
  const startRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (visible) {
      const clamped = clampPixel(
        initialPixel.x,
        initialPixel.y,
        imageWidth,
        imageHeight
      );
      setPixel(clamped);
    }
  }, [visible, initialPixel.x, initialPixel.y, imageWidth, imageHeight]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    samplePixelColor(imageUri, imageWidth, imageHeight, pixel.x, pixel.y).then((hex) => {
      if (!cancelled && hex) setPreviewHex(hex);
    });
    return () => {
      cancelled = true;
    };
  }, [visible, imageUri, imageWidth, imageHeight, pixel.x, pixel.y]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startRef.current = { x: pixelRef.current.x, y: pixelRef.current.y };
        },
        onPanResponderMove: (_, gestureState) => {
          const start = startRef.current;
          setPixel(
            clampPixel(
              start.x + gestureState.dx / LOUPE_ZOOM,
              start.y + gestureState.dy / LOUPE_ZOOM,
              imageWidth,
              imageHeight
            )
          );
        },
      }),
    [imageWidth, imageHeight]
  );

  const handleAdd = async () => {
    if (isSampling) return;
    setIsSampling(true);
    try {
      const hex = await samplePixelColor(
        imageUri,
        imageWidth,
        imageHeight,
        pixel.x,
        pixel.y
      );
      if (hex) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onConfirm(hex);
      } else {
        Alert.alert(
          "Couldn't sample color",
          "The image could not be read for color sampling. Try a JPEG or PNG image, or pick a different spot."
        );
      }
    } finally {
      setIsSampling(false);
    }
  };

  if (!visible) return null;

  const scale = LOUPE_ZOOM;
  const imgDisplayW = imageWidth * scale;
  const imgDisplayH = imageHeight * scale;
  const offsetX = LOUPE_SIZE / 2 - pixel.x * scale;
  const offsetY = LOUPE_SIZE / 2 - pixel.y * scale;
  const hsl = hexToHsl(previewHex);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.root, { backgroundColor: theme.colors.surfaceContainerLow }]}>
        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFillObject} blurRadius={2} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(0,0,0,0.15)" }]} />

        <View
          style={{
            paddingTop: insets.top + theme.spacing.md,
            paddingHorizontal: theme.spacing["2xl"],
            paddingBottom: theme.spacing.lg,
            backgroundColor: theme.colors.surfaceContainerLow,
          }}
        >
          <View className="flex-row items-center justify-between">
            <Pressable onPress={onCancel} hitSlop={12}>
              <X size={24} color={theme.colors.primary} />
            </Pressable>
            <Text
              style={{
                fontFamily: fontFamilies.displayItalic,
                fontSize: 24,
                color: theme.colors.onSurface,
              }}
            >
              Pigment
            </Text>
            <Text
              style={{
                fontFamily: fontFamilies.label,
                fontSize: 10,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: `${theme.colors.onSurface}99`,
              }}
            >
              Sampler
            </Text>
          </View>
        </View>

        <View style={styles.viewport} {...panResponder.panHandlers}>
          <View
            style={[
              styles.loupeRing,
              {
                width: LOUPE_SIZE,
                height: LOUPE_SIZE,
                borderRadius: LOUPE_SIZE / 2,
                borderWidth: 3,
                borderColor: "rgba(255, 255, 255, 0.95)",
                shadowColor: "#ffffff",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 8,
              },
            ]}
          >
            <View
              style={[
                styles.loupe,
                {
                  width: LOUPE_SIZE,
                  height: LOUPE_SIZE,
                  borderRadius: LOUPE_SIZE / 2,
                  backgroundColor: theme.colors.surfaceContainer,
                },
              ]}
            >
              <Image
                source={{ uri: imageUri }}
                style={{
                  position: "absolute",
                  left: offsetX,
                  top: offsetY,
                  width: imgDisplayW,
                  height: imgDisplayH,
                }}
                resizeMode="stretch"
              />
            </View>
            <View style={[styles.crosshairH, { backgroundColor: "rgba(255,255,255,0.8)" }]} />
            <View style={[styles.crosshairV, { backgroundColor: "rgba(255,255,255,0.8)" }]} />
            <View
              style={[
                styles.centerDot,
                {
                  width: CROSSHAIR_R * 2,
                  height: CROSSHAIR_R * 2,
                  borderRadius: CROSSHAIR_R,
                  backgroundColor: "#ffffff",
                },
              ]}
            />
          </View>

          <View style={styles.previewBubble}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: previewHex,
                borderWidth: 4,
                borderColor: "#ffffff",
              }}
            />
            <View
              style={{
                marginTop: theme.spacing.sm,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.glass,
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamilies.label,
                  fontSize: 10,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: theme.colors.onSurface,
                }}
              >
                {previewHex.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + theme.spacing.lg,
            left: theme.spacing.lg,
            right: theme.spacing.lg,
          }}
        >
          <View style={{ gap: theme.spacing.lg }}>
            <View
              style={{
                backgroundColor: theme.colors.glass,
                borderRadius: theme.radius["3xl"],
                padding: theme.spacing["2xl"],
                borderWidth: 1,
                borderColor: theme.colors.glassBorder,
                gap: theme.spacing.lg,
              }}
            >
              <View className="flex-row" style={{ gap: theme.spacing.lg }}>
                {[
                  { label: "Hue", value: `${hsl.h}°` },
                  { label: "Saturation", value: `${hsl.s}%` },
                  { label: "Luminance", value: `${hsl.l}%` },
                ].map((item) => (
                  <View key={item.label} style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: fontFamilies.label,
                        fontSize: 10,
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                        color: `${theme.colors.onSurfaceVariant}99`,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{
                        fontFamily: fontFamilies.bodyMedium,
                        fontSize: 14,
                        color: theme.colors.onSurface,
                      }}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
              <Pressable
              onPress={handleAdd}
              disabled={isSampling}
              style={({ pressed }) => ({
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: theme.spacing.lg,
                borderRadius: theme.radius.full,
                backgroundColor: isSampling
                  ? theme.colors.surfaceContainerHighest
                  : ctaBackground,
                opacity: pressed && !isSampling ? 0.9 : 1,
                shadowColor: theme.colors.onSurface,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 4,
              })}
            >
              <Text
                style={{
                  fontFamily: fontFamilies.label,
                  fontSize: 12,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  fontWeight: "700",
                  color: theme.colors.secondary,
                }}
              >
                {isSampling ? "Sampling…" : "Add to Palette"}
              </Text>
            </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  viewport: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loupeRing: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  loupe: {
    overflow: "hidden",
  },
  crosshairH: {
    position: "absolute",
    width: "100%",
    height: 1,
  },
  crosshairV: {
    position: "absolute",
    height: "100%",
    width: 1,
  },
  centerDot: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  previewBubble: {
    position: "absolute",
    top: "18%",
    alignItems: "center",
  },
});
