import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const availabilityOptions = [
  "unknown",
  "18:00-20:00 CEST",
  "20:00-22:00 CEST",
  "All blocks",
  "cannot"
] as const;

export const roleTypes = ["Tank", "DPS", "Support"] as const;

export const dayOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
] as const;

export const eventTypes = ["Tournament", "Scrim", "VOD Review"] as const;

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStartDate: text("week_start_date").notNull(),
  weekEndDate: text("week_end_date").notNull(),
  scheduleData: jsonb("schedule_data").notNull(),
  googleSheetId: text("google_sheet_id"),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  eventType: text("event_type").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  description: text("description"),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export type AvailabilityOption = typeof availabilityOptions[number];
export type RoleType = typeof roleTypes[number];
export type DayOfWeek = typeof dayOfWeek[number];
export type EventType = typeof eventTypes[number];

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export interface PlayerAvailability {
  playerId: string;
  playerName: string;
  role: RoleType;
  availability: {
    [key in DayOfWeek]: AvailabilityOption;
  };
}

export interface ScheduleData {
  players: PlayerAvailability[];
}
