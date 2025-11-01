import type { Player, InsertPlayer, Schedule, InsertSchedule, ScheduleData } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getSchedule(weekStartDate: string, weekEndDate: string): Promise<Schedule | undefined>;
  saveSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getAllPlayers(): Promise<Player[]>;
  addPlayer(player: InsertPlayer): Promise<Player>;
  removePlayer(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private schedules: Map<string, Schedule>;
  private players: Map<string, Player>;

  constructor() {
    this.schedules = new Map();
    this.players = new Map();
  }

  async getSchedule(weekStartDate: string, weekEndDate: string): Promise<Schedule | undefined> {
    const key = `${weekStartDate}_${weekEndDate}`;
    return this.schedules.get(key);
  }

  async saveSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = randomUUID();
    const schedule: Schedule = { 
      ...insertSchedule, 
      id,
      scheduleData: insertSchedule.scheduleData as any
    };
    const key = `${insertSchedule.weekStartDate}_${insertSchedule.weekEndDate}`;
    this.schedules.set(key, schedule);
    return schedule;
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async addPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = { ...insertPlayer, id };
    this.players.set(id, player);
    return player;
  }

  async removePlayer(id: string): Promise<boolean> {
    return this.players.delete(id);
  }
}

export const storage = new MemStorage();
