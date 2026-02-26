import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Image,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import { samplePixelColor } from "../lib/colorSampler";

const LOUPE_SIZE = 160;
const LOUPE_ZOOM = 1;
const CROSSHAIR_R = 12;
const BORDER_WIDTH = 2;

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
  const [pixel, setPixel] = useState(() =>
    clampPixel(initialPixel.x, initialPixel.y, imageWidth, imageHeight)
  );
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

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startRef.current = { x: pixelRef.current.x, y: pixelRef.current.y };
        },
        onPanResponderMove: (_, gestureState) => {
          const scale = LOUPE_ZOOM;
          const start = startRef.current;
          setPixel(
            clampPixel(
              start.x + gestureState.dx / scale,
              start.y + gestureState.dy / scale,
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.content} {...panResponder.panHandlers}>
          <View style={styles.loupeContainer}>
            <View style={styles.loupe}>
              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.loupeImage,
                  {
                    left: offsetX,
                    top: offsetY,
                    width: imgDisplayW,
                    height: imgDisplayH,
                  },
                ]}
                resizeMode="stretch"
              />
            </View>
            <View style={styles.crosshair} pointerEvents="none" />
          </View>
          <Text style={styles.hint}>Drag to move • Tap Add to pick color</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAdd}
              disabled={isSampling}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>
                {isSampling ? "…" : "Add to palette"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    backgroundColor: "#1c1917",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    maxWidth: 320,
  },
  loupeContainer: {
    marginBottom: 12,
    borderRadius: LOUPE_SIZE / 2 + 4,
    borderWidth: BORDER_WIDTH,
    borderColor: "#57534e",
    position: "relative",
    width: LOUPE_SIZE + BORDER_WIDTH * 2,
    height: LOUPE_SIZE + BORDER_WIDTH * 2,
  },
  loupe: {
    position: "absolute",
    left: BORDER_WIDTH,
    top: BORDER_WIDTH,
    width: LOUPE_SIZE,
    height: LOUPE_SIZE,
    backgroundColor: "#292524",
    overflow: "hidden",
    borderRadius: LOUPE_SIZE / 2,
  },
  loupeImage: {
    position: "absolute",
  },
  crosshair: {
    position: "absolute",
    left: BORDER_WIDTH + LOUPE_SIZE / 2 - CROSSHAIR_R,
    top: BORDER_WIDTH + LOUPE_SIZE / 2 - CROSSHAIR_R,
    width: CROSSHAIR_R * 2,
    height: CROSSHAIR_R * 2,
    borderRadius: CROSSHAIR_R,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
  },
  hint: {
    color: "#a8a29e",
    fontSize: 13,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#44403c",
  },
  cancelButtonText: {
    color: "#e7e5e4",
    fontSize: 16,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#3b82f6",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
