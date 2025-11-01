import type { Player, InsertPlayer, Schedule, InsertSchedule, Setting, InsertSetting, Event, InsertEvent } from "@shared/schema";
import { players, schedules, settings, events } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getSchedule(weekStartDate: string, weekEndDate: string): Promise<Schedule | undefined>;
  saveSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getAllPlayers(): Promise<Player[]>;
  addPlayer(player: InsertPlayer): Promise<Player>;
  removePlayer(id: string): Promise<boolean>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<Setting>;
  getAllEvents(): Promise<Event[]>;
  addEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  removeEvent(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  async getSchedule(weekStartDate: string, weekEndDate: string): Promise<Schedule | undefined> {
    const result = await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.weekStartDate, weekStartDate),
          eq(schedules.weekEndDate, weekEndDate)
        )
      )
      .limit(1);

    return result[0];
  }

  async saveSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const existing = await this.getSchedule(
      insertSchedule.weekStartDate,
      insertSchedule.weekEndDate
    );

    if (existing) {
      const updated = await db
        .update(schedules)
        .set({
          scheduleData: insertSchedule.scheduleData as any,
          googleSheetId: insertSchedule.googleSheetId,
        })
        .where(eq(schedules.id, existing.id))
        .returning();

      return updated[0];
    }

    const inserted = await db
      .insert(schedules)
      .values(insertSchedule)
      .returning();

    return inserted[0];
  }

  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async addPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const inserted = await db
      .insert(players)
      .values(insertPlayer)
      .returning();

    return inserted[0];
  }

  async removePlayer(id: string): Promise<boolean> {
    const deleted = await db
      .delete(players)
      .where(eq(players.id, id))
      .returning();

    return deleted.length > 0;
  }

  async getSetting(key: string): Promise<string | null> {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    return result[0]?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<Setting> {
    const existing = await this.getSetting(key);

    if (existing !== null) {
      const updated = await db
        .update(settings)
        .set({ value })
        .where(eq(settings.key, key))
        .returning();

      return updated[0];
    }

    const inserted = await db
      .insert(settings)
      .values({ key, value })
      .returning();

    return inserted[0];
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async addEvent(insertEvent: InsertEvent): Promise<Event> {
    const inserted = await db
      .insert(events)
      .values(insertEvent)
      .returning();

    return inserted[0];
  }

  async updateEvent(id: string, updateData: Partial<InsertEvent>): Promise<Event> {
    const updated = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    return updated[0];
  }

  async removeEvent(id: string): Promise<boolean> {
    const deleted = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();

    return deleted.length > 0;
  }
}

export const storage = new DbStorage();
