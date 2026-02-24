import { createContext, useContext, type ReactNode } from "react";
import { useLiveQuery } from "drizzle-orm/expo-sqlite/query";
import { db } from "../../db";
import { projects } from "../../db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type Project = InferSelectModel<typeof projects>;

type ProjectsContextValue = {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { data, error } = useLiveQuery(db.select().from(projects));

  const value: ProjectsContextValue = {
    projects: data ?? [],
    isLoading: data === undefined,
    error: error ?? null,
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (ctx === null) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return ctx;
}
