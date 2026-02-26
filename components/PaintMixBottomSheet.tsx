import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hexToRybMix } from "../lib/colorMixing";
import { MixDonutChart } from "./MixDonutChart";
import { Trash2 } from "lucide-react-native";
import { theme } from "../theme";

export interface PaintMixBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Palette color hex (e.g. #2d5016) */
  hex: string;
  /** If provided, show a button to remove this color from the palette */
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
  }, [colorId, onDelete, isDeleting]);

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
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
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
            backgroundColor: theme.colors.surfaceElevated,
            borderTopLeftRadius: theme.radius.lg,
            borderTopRightRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.md,
            paddingBottom: insets.bottom + theme.spacing.lg,
            maxHeight: windowHeight * 0.7,
          },
          { transform: [{ translateY: sheetTranslateY }] },
        ]}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.handle,
            {
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.colors.border,
              marginBottom: theme.spacing.sm,
            },
          ]}
        />
        <View style={styles.content}>
          <Text
            className="font-semibold text-lg mb-1"
            style={{ color: theme.colors.text }}
          >
            Mix this color
          </Text>
          <Text
            className="text-sm mb-4"
            style={{ color: theme.colors.textSecondary }}
          >
            Approximate mix using red, yellow, blue, white, and black.
          </Text>
          <View style={styles.swatchRow}>
            <View
              style={[
                styles.targetSwatch,
                {
                  backgroundColor: hex,
                  borderRadius: theme.radius.full,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                },
              ]}
            />
            <Text
              className="text-sm ml-3"
              style={{ color: theme.colors.textSecondary }}
            >
              Target color
            </Text>
          </View>
          {mix ? (
            <View style={styles.chartWrap}>
              <MixDonutChart mix={mix} />
            </View>
          ) : (
            <Text
              className="text-sm"
              style={{ color: theme.colors.textTertiary }}
            >
              Unable to compute mix.
            </Text>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: theme.spacing.md,
            gap: theme.spacing.md,
          }}
        >
          <TouchableOpacity
            onPress={handleClose}
            style={[
              styles.closeButton,
              {
                flex: 1,
                paddingVertical: theme.spacing.md,
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.muted,
              },
            ]}
            activeOpacity={0.8}
            accessibilityLabel="Close"
          >
            <Text
              className="font-medium"
              style={{ color: theme.colors.text }}
            >
              Done
            </Text>
          </TouchableOpacity>
          {colorId != null && onDelete != null && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isDeleting}
              style={{
                width: 44,
                height: 44,
                borderRadius: theme.radius.sm,
                borderWidth: 1,
                borderColor: theme.colors.destructive,
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
              accessibilityLabel="Remove from palette"
            >
              <Trash2
                size={20}
                color={theme.colors.destructive}
              />
            </TouchableOpacity>
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
  handle: {
    alignSelf: "center",
  },
  content: {
    paddingBottom: 8,
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  targetSwatch: {
    width: 40,
    height: 40,
  },
  chartWrap: {
    alignItems: "center",
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});
