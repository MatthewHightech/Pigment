import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import type { RybMix } from "../lib/colorMixing";
import { getRybSegments } from "../lib/colorMixing";

const SIZE = 140;
const STROKE_WIDTH = 24;
const cx = SIZE / 2;
const cy = SIZE / 2;
const outerR = SIZE / 2 - 2;
const innerR = outerR - STROKE_WIDTH;

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * Builds a single donut segment path (from startAngle for sweepAngle degrees).
 * Skia: 0° = positive x-axis, positive sweep = clockwise.
 */
function buildSegmentPath(
  startAngleDeg: number,
  sweepAngleDeg: number
): ReturnType<typeof Skia.Path.Make> {
  const path = Skia.Path.Make();
  const startRad = degToRad(startAngleDeg);
  const endRad = degToRad(startAngleDeg + sweepAngleDeg);
  path.moveTo(cx, cy);
  path.lineTo(cx + outerR * Math.cos(startRad), cy + outerR * Math.sin(startRad));
  path.arcToOval(
    { x: cx - outerR, y: cy - outerR, width: outerR * 2, height: outerR * 2 },
    startAngleDeg,
    sweepAngleDeg,
    false
  );
  path.lineTo(cx + innerR * Math.cos(endRad), cy + innerR * Math.sin(endRad));
  path.arcToOval(
    { x: cx - innerR, y: cy - innerR, width: innerR * 2, height: innerR * 2 },
    startAngleDeg + sweepAngleDeg,
    -sweepAngleDeg,
    false
  );
  path.close();
  return path;
}

export interface MixDonutChartProps {
  mix: RybMix;
}

export function MixDonutChart({ mix }: MixDonutChartProps) {
  const segments = useMemo(() => getRybSegments(mix), [mix]);

  if (segments.length === 0) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Text className="text-zinc-500 text-sm">No mix data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {segments.map((seg, i) => (
          <Path
            key={seg.key}
            path={buildSegmentPath(seg.startAngle, seg.sweepAngle)}
            color={seg.hex}
          />
        ))}
      </Canvas>
      <View style={styles.legend}>
        {segments.map((seg) => (
          <View key={seg.key} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: seg.hex }]} />
            <Text className="text-zinc-700 text-sm">
              {seg.label} {Math.round(seg.percent)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  placeholder: {
    height: SIZE,
    justifyContent: "center",
  },
  canvas: {
    width: SIZE,
    height: SIZE,
  },
  legend: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#d4d4d8",
  },
});
