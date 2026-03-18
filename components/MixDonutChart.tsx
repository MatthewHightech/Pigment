import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import type { RybMix } from "../lib/colorMixing";
import { getRybSegments } from "../lib/colorMixing";
import { theme } from "../theme";

const SIZE = 140;
const STROKE_WIDTH = 24;
const cx = SIZE / 2;
const cy = SIZE / 2;
const outerR = SIZE / 2 - 2;
const innerR = outerR - STROKE_WIDTH;

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

interface DonutSegment {
  key: keyof RybMix;
  label: string;
  hex: string;
  percent: number;
  startAngle: number;
  sweepAngle: number;
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

/**
 * If there are more than 2 segments, drop any segments smaller than 9% and
 * redistribute their percentage proportionally across the remaining segments.
 * This keeps the chart readable while preserving relative proportions.
 */
function adjustSegments(segments: DonutSegment[]): DonutSegment[] {
  if (segments.length <= 2) return segments;

  const total = segments.reduce((sum, seg) => sum + seg.percent, 0);
  if (total <= 0) return segments;

  const major = segments.filter((seg) => seg.percent >= 7);
  // If everything is small, or nothing qualifies, keep the original breakdown.
  if (major.length === 0 || major.length === segments.length) {
    return segments;
  }

  const keptTotal = major.reduce((sum, seg) => sum + seg.percent, 0);
  if (keptTotal <= 0) return segments;

  let start = 0;
  return major.map((seg) => {
    const normalizedPercent = (seg.percent / keptTotal) * total;
    const sweepAngle = (normalizedPercent / total) * 360;
    const adjusted: DonutSegment = {
      ...seg,
      percent: normalizedPercent,
      startAngle: start,
      sweepAngle,
    };
    start += sweepAngle;
    return adjusted;
  });
}

export interface MixDonutChartProps {
  mix: RybMix;
}

export function MixDonutChart({ mix }: MixDonutChartProps) {
  const rawSegments = useMemo(() => getRybSegments(mix), [mix]);
  const segments = useMemo(() => adjustSegments(rawSegments), [rawSegments]);

  if (segments.length === 0) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <Text style={{ color: theme.colors.textTertiary, fontSize: 14 }}>
          No mix data
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {segments.map((seg) => (
          <Path
            key={seg.key}
            path={buildSegmentPath(seg.startAngle, seg.sweepAngle)}
            color={seg.hex}
          />
        ))}
      </Canvas>
      <View
        style={[
          styles.legend,
          { marginTop: theme.spacing.md, gap: theme.spacing.md },
        ]}
      >
        {segments.map((seg) => (
          <View key={seg.key} style={styles.legendRow}>
            <View
              style={[
                styles.swatch,
                {
                  backgroundColor: seg.hex,
                  borderColor: theme.colors.border,
                },
              ]}
            />
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: 14,
                marginLeft: 6,
              }}
            >
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
});
