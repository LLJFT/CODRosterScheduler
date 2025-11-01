import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScheduleSchema } from "@shared/schema";
import { 
  readScheduleFromSheet, 
  writeScheduleToSheet, 
  convertScheduleToSheetData,
  convertSheetDataToSchedule 
} from "./google-sheets";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/schedule", async (req, res) => {
    try {
      const { weekStartDate, weekEndDate } = req.query;
      
      if (!weekStartDate || !weekEndDate) {
        return res.status(400).json({ 
          error: "weekStartDate and weekEndDate are required" 
        });
      }

      const schedule = await storage.getSchedule(
        weekStartDate as string, 
        weekEndDate as string
      );

      if (schedule) {
        return res.json(schedule);
      }

      try {
        const sheetName = `Week_${weekStartDate}`;
        const sheetData = await readScheduleFromSheet(sheetName);
        
        if (sheetData && sheetData.length > 3) {
          const scheduleData = convertSheetDataToSchedule(sheetData);
          
          const newSchedule = await storage.saveSchedule({
            weekStartDate: weekStartDate as string,
            weekEndDate: weekEndDate as string,
            scheduleData: scheduleData as any,
            googleSheetId: sheetName,
          });

          return res.json(newSchedule);
        }
      } catch (sheetError) {
        console.error('Error reading from sheet, returning empty schedule:', sheetError);
      }

      const emptySchedule = await storage.saveSchedule({
        weekStartDate: weekStartDate as string,
        weekEndDate: weekEndDate as string,
        scheduleData: { players: [] } as any,
        googleSheetId: `Week_${weekStartDate}`,
      });

      return res.json(emptySchedule);
    } catch (error: any) {
      console.error('Error in GET /api/schedule:', error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/schedule", async (req, res) => {
    try {
      const validatedData = insertScheduleSchema.parse(req.body);
      
      const sheetName = `Week_${validatedData.weekStartDate}`;
      const sheetData = convertScheduleToSheetData(
        validatedData.scheduleData,
        validatedData.weekStartDate,
        validatedData.weekEndDate
      );

      await writeScheduleToSheet(sheetName, sheetData);

      const schedule = await storage.saveSchedule({
        ...validatedData,
        googleSheetId: sheetName,
      });

      res.json(schedule);
    } catch (error: any) {
      console.error('Error in POST /api/schedule:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid schedule data", details: error.errors });
      }
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error: any) {
      console.error('Error in GET /api/players:', error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
