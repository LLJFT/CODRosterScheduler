import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlayerAvailability, DayOfWeek } from "@shared/schema";
import { dayOfWeek } from "@shared/schema";
import { TrendingUp, Users, Clock } from "lucide-react";

interface AvailabilityAnalyticsProps {
  scheduleData: PlayerAvailability[];
}

interface TimeSlotAnalysis {
  day: DayOfWeek;
  timeSlot: string;
  availableCount: number;
  availablePlayers: string[];
  percentage: number;
}

const dayDisplayNames: Record<DayOfWeek, string> = {
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
  Sunday: "Sunday",
};

export function AvailabilityAnalytics({ scheduleData }: AvailabilityAnalyticsProps) {
  if (scheduleData.length === 0) {
    return null;
  }

  const analyzeTimeSlots = (): TimeSlotAnalysis[] => {
    const timeSlots = ["18:00-20:00 CEST", "20:00-22:00 CEST"];
    const analysis: TimeSlotAnalysis[] = [];

    dayOfWeek.forEach((day) => {
      timeSlots.forEach((timeSlot) => {
        const availablePlayers = scheduleData.filter((player) => {
          const availability = player.availability[day];
          return availability === timeSlot || availability === "All blocks";
        });

        analysis.push({
          day,
          timeSlot,
          availableCount: availablePlayers.length,
          availablePlayers: availablePlayers.map((p) => p.playerName),
          percentage: (availablePlayers.length / scheduleData.length) * 100,
        });
      });
    });

    return analysis.sort((a, b) => b.availableCount - a.availableCount);
  };

  const getBestTrainingTimes = (): TimeSlotAnalysis[] => {
    const allSlots = analyzeTimeSlots();
    // Show slots where at least 1 player is available, sorted by most available
    return allSlots.filter(slot => slot.availableCount > 0).slice(0, 5);
  };

  const getMostAvailableDay = (): { day: DayOfWeek; count: number } | null => {
    const dayCounts: Record<DayOfWeek, number> = {} as any;

    dayOfWeek.forEach((day) => {
      const available = scheduleData.filter((player) => {
        const availability = player.availability[day];
        return availability !== "unknown" && availability !== "cannot";
      });
      dayCounts[day] = available.length;
    });

    const bestDay = Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0];
    if (!bestDay) return null;

    return {
      day: bestDay[0] as DayOfWeek,
      count: bestDay[1],
    };
  };

  const bestTimes = getBestTrainingTimes();
  const mostAvailableDay = getMostAvailableDay();

  if (bestTimes.length === 0) {
    return (
      <Card className="p-6 border-border" data-testid="analytics-empty">
        <div className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No data available for analytics. Please add player availability.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 border-border" data-testid="analytics-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Availability Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Best training times based on player availability
            </p>
          </div>
        </div>

        {mostAvailableDay && (
          <div className="mb-6 p-4 rounded-lg bg-accent/50 border border-accent-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-accent-foreground" />
              <span className="text-sm font-medium text-accent-foreground">
                Most Available Day
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground">
                {dayDisplayNames[mostAvailableDay.day]}
              </span>
              <Badge variant="secondary" className="text-xs">
                {mostAvailableDay.count} of {scheduleData.length} players available
              </Badge>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Recommended Training Times
          </h4>

          {bestTimes.map((slot, index) => (
            <div
              key={`${slot.day}-${slot.timeSlot}`}
              className="p-4 rounded-lg border border-border hover-elevate"
              data-testid={`best-time-slot-${index}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-semibold text-sm">
                    #{index + 1}
                  </Badge>
                  <div>
                    <span className="font-semibold text-foreground">
                      {dayDisplayNames[slot.day]}
                    </span>
                    <span className="text-sm text-muted-foreground mx-2">•</span>
                    <span className="text-sm text-muted-foreground">{slot.timeSlot}</span>
                  </div>
                </div>
                <Badge
                  variant={slot.percentage >= 75 ? "default" : "secondary"}
                  className="gap-1.5"
                >
                  <Users className="h-3 w-3" />
                  <span className="font-semibold">
                    {slot.availableCount}/{scheduleData.length}
                  </span>
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      slot.percentage >= 75
                        ? "bg-primary"
                        : slot.percentage >= 50
                        ? "bg-yellow-500"
                        : "bg-muted-foreground"
                    }`}
                    style={{ width: `${slot.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground min-w-[45px] text-left">
                  {Math.round(slot.percentage)}%
                </span>
              </div>

              {slot.availablePlayers.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1.5">Available Players:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {slot.availablePlayers.map((playerName) => (
                      <Badge key={playerName} variant="secondary" className="text-xs">
                        {playerName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {bestTimes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recommended training times
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
