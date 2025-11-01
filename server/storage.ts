import type { Player, InsertPlayer, Schedule, InsertSchedule } from "@shared/schema";
import { players, schedules } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getSchedule(weekStartDate: string, weekEndDate: string): Promise<Schedule | undefined>;
  saveSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getAllPlayers(): Promise<Player[]>;
  addPlayer(player: InsertPlayer): Promise<Player>;
  removePlayer(id: string): Promise<boolean>;
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
}

export const storage = new DbStorage();
