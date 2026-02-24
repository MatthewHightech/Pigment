import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  imageUri: text("image_uri").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const colors = sqliteTable("colors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  hexValue: text("hex_value").notNull(),
  rPercentage: real("r_percentage").notNull(),
  yPercentage: real("y_percentage").notNull(),
  bPercentage: real("b_percentage").notNull(),
  wPercentage: real("w_percentage").notNull(),
  blkPercentage: real("blk_percentage").notNull(),
});
