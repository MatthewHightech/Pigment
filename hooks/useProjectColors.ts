import { useCallback } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite/query";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { colors } from "../db/schema";

export interface ProjectColor {
  id: number;
  projectId: number;
  hexValue: string;
  rPercentage: number;
  yPercentage: number;
  bPercentage: number;
  wPercentage: number;
  blkPercentage: number;
}

const ZERO_PERCENT = 0;

export function useProjectColors(projectId: number | undefined) {
  const { data, error } = useLiveQuery(
    db
      .select()
      .from(colors)
      .where(eq(colors.projectId, projectId ?? -1))
  );

  const list = projectId === undefined ? [] : (data ?? []);
  const addColor = useCallback(
    async (hexValue: string) => {
      if (projectId == null) return;
      await db.insert(colors).values({
        projectId,
        hexValue,
        rPercentage: ZERO_PERCENT,
        yPercentage: ZERO_PERCENT,
        bPercentage: ZERO_PERCENT,
        wPercentage: ZERO_PERCENT,
        blkPercentage: ZERO_PERCENT,
      });
    },
    [projectId]
  );

  return {
    colors: list as ProjectColor[],
    addColor,
    isLoading: data === undefined,
    error: error ?? null,
  };
}
