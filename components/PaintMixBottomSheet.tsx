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

export interface PaintMixBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Palette color hex (e.g. #2d5016) */
  hex: string;
}

const ANIM_DURATION_OPEN = 280;
const ANIM_DURATION_CLOSE = 220;

export function PaintMixBottomSheet({
  visible,
  onClose,
  hex,
}: PaintMixBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(windowHeight)).current;
  const isClosingRef = useRef(false);

  const mix = React.useMemo(() => hexToRybMix(hex), [hex]);

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
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents={visible ? "auto" : "none"}
        />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + 16,
            maxHeight: windowHeight * 0.7,
          },
          { transform: [{ translateY: sheetTranslateY }] },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.handle} />
        <View style={styles.content}>
            <Text className="text-zinc-800 font-semibold text-lg mb-1">
              Mix this color
            </Text>
            <Text className="text-zinc-600 text-sm mb-4">
              Approximate mix using red, yellow, blue, white, and black.
            </Text>
            <View style={styles.swatchRow}>
              <View
                style={[styles.targetSwatch, { backgroundColor: hex }]}
              />
              <Text className="text-zinc-600 text-sm ml-3">
                Target color
              </Text>
            </View>
            {mix ? (
              <>
                <View style={styles.chartWrap}>
                  <MixDonutChart mix={mix} />
                </View>
              </>
            ) : (
              <Text className="text-zinc-500 text-sm">Unable to compute mix.</Text>
            )}
        </View>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
          activeOpacity={0.8}
          accessibilityLabel="Close"
        >
          <Text className="text-zinc-800 font-medium">Done</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d4d4d8",
    marginBottom: 8,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d4d4d8",
  },
  chartWrap: {
    alignItems: "center",
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f4f4f5",
    borderRadius: 10,
  },
});
