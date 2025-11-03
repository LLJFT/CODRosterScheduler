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

export const eventResults = ["win", "loss", "draw", "pending"] as const;

export const attendanceStatuses = ["attended", "late", "absent"] as const;

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  snapchat: text("snapchat"),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().references(() => players.id),
  date: text("date").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  ringer: text("ringer"),
});

export const teamNotes = pgTable("team_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderName: text("sender_name").notNull(),
  message: text("message").notNull(),
  timestamp: text("timestamp").notNull(),
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
  result: text("result"),
  opponentName: text("opponent_name"),
  notes: text("notes"),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  gameCode: text("game_code").notNull(),
  score: text("score").notNull(),
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

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
});

export const insertTeamNotesSchema = createInsertSchema(teamNotes).omit({
  id: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
});

export type AvailabilityOption = typeof availabilityOptions[number];
export type RoleType = typeof roleTypes[number];
export type DayOfWeek = typeof dayOfWeek[number];
export type EventType = typeof eventTypes[number];
export type EventResult = typeof eventResults[number];
export type AttendanceStatus = typeof attendanceStatuses[number];

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type TeamNotes = typeof teamNotes.$inferSelect;
export type InsertTeamNotes = z.infer<typeof insertTeamNotesSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

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
