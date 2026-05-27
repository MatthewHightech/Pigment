import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Trash2, X } from "lucide-react-native";
import { hexToRybMix } from "../lib/colorMixing";
import { MixDonutChart } from "./MixDonutChart";
import { useTheme } from "../hooks/ThemeContext";
import { PrimaryButton } from "./ui/Buttons";
import { fontFamilies } from "../theme";

export interface PaintMixBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  hex: string;
  colorId?: number | null;
  onDelete?: (colorId: number) => Promise<void>;
}

const ANIM_DURATION_OPEN = 280;
const ANIM_DURATION_CLOSE = 220;

export function PaintMixBottomSheet({
  visible,
  onClose,
  hex,
  colorId,
  onDelete,
}: PaintMixBottomSheetProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(windowHeight)).current;
  const isClosingRef = useRef(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const mix = React.useMemo(() => hexToRybMix(hex), [hex]);

  const handleDelete = React.useCallback(async () => {
    if (colorId == null || !onDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(colorId);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }, [colorId, onDelete, isDeleting, onClose]);

  useEffect(() => {
    if (!visible) return;
    isClosingRef.current = false;
    backdropOpacity.setValue(0);
    sheetTranslateY.setValue(windowHeight);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: ANIM_DURATION_OPEN,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: ANIM_DURATION_OPEN,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, windowHeight, backdropOpacity, sheetTranslateY]);

  const handleClose = React.useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: ANIM_DURATION_CLOSE,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: windowHeight,
        duration: ANIM_DURATION_CLOSE,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onClose();
    });
  }, [onClose, windowHeight, backdropOpacity, sheetTranslateY]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: theme.colors.backdrop, opacity: backdropOpacity },
          ]}
          pointerEvents={visible ? "auto" : "none"}
        />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.surfaceContainerLowest,
            borderTopLeftRadius: theme.radius["3xl"],
            borderTopRightRadius: theme.radius["3xl"],
            paddingHorizontal: theme.spacing["2xl"],
            paddingTop: theme.spacing.lg,
            paddingBottom: insets.bottom + theme.spacing["2xl"],
            maxHeight: windowHeight * 0.78,
          },
          { transform: [{ translateY: sheetTranslateY }] },
        ]}
        pointerEvents="box-none"
      >
        <View
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colors.outlineVariant,
            alignSelf: "center",
            marginBottom: theme.spacing.lg,
            opacity: 0.5,
          }}
        />

        <View className="flex-row items-start justify-between" style={{ marginBottom: theme.spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fontFamilies.displayItalic,
                fontSize: 32,
                color: theme.colors.onSurface,
                marginBottom: theme.spacing.xs,
              }}
            >
              The Mix
            </Text>
            <Text
              style={{
                fontFamily: fontFamilies.body,
                fontSize: 14,
                lineHeight: 20,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Approximate mix using red, yellow, blue, white, and black.
            </Text>
          </View>
          <Pressable onPress={handleClose} hitSlop={12}>
            <X size={22} color={theme.colors.onSurfaceVariant} />
          </Pressable>
        </View>

        <View className="flex-row items-center" style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.md }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: theme.radius.full,
              backgroundColor: hex,
              borderWidth: 1,
              borderColor: `${theme.colors.outlineVariant}66`,
            }}
          />
          <View>
            <Text
              style={{
                fontFamily: fontFamilies.label,
                fontSize: 10,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Target color
            </Text>
            <Text
              style={{
                fontFamily: fontFamilies.bodyMedium,
                fontSize: 16,
                color: theme.colors.onSurface,
              }}
            >
              {hex.toUpperCase()}
            </Text>
          </View>
        </View>

        {mix ? (
          <View style={{ alignItems: "center", marginBottom: theme.spacing.lg }}>
            <MixDonutChart mix={mix} />
          </View>
        ) : (
          <Text
            style={{
              fontFamily: fontFamilies.body,
              fontSize: 14,
              color: theme.colors.onSurfaceVariant,
              marginBottom: theme.spacing.lg,
            }}
          >
            Unable to compute mix.
          </Text>
        )}

        <View className="flex-row items-center" style={{ gap: theme.spacing.md }}>
          <PrimaryButton label="Done" onPress={handleClose} style={{ flex: 1 }} />
          {colorId != null && onDelete != null && (
            <Pressable
              onPress={handleDelete}
              disabled={isDeleting}
              style={({ pressed }) => ({
                width: 52,
                height: 52,
                borderRadius: theme.radius.full,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.surfaceContainerLow,
                opacity: pressed || isDeleting ? 0.7 : 1,
              })}
              accessibilityLabel="Remove from palette"
            >
              <Trash2 size={20} color={theme.colors.destructive} />
            </Pressable>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
