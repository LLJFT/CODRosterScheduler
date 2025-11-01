import { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { PlayerAvailability, DayOfWeek, AvailabilityOption } from "@shared/schema";
import { dayOfWeek, availabilityOptions } from "@shared/schema";

interface ScheduleTableProps {
  scheduleData: PlayerAvailability[];
  onAvailabilityChange: (playerId: string, day: DayOfWeek, availability: AvailabilityOption) => void;
  isLoading?: boolean;
}

const roleColors: Record<string, string> = {
  Tank: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-500/20",
  DPS: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/20",
  Support: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20",
  Sub: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 border-yellow-500/20",
  Coach: "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/20",
};

const availabilityColors: Record<AvailabilityOption, string> = {
  "unknown": "bg-muted text-muted-foreground",
  "18:00-20:00 CEST": "bg-primary/10 text-primary dark:bg-primary/20",
  "20:00-22:00 CEST": "bg-primary/10 text-primary dark:bg-primary/20",
  "All blocks": "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  "cannot": "bg-destructive/10 text-destructive dark:bg-destructive/20",
};

const availabilityDisplayText: Record<AvailabilityOption, string> = {
  "unknown": "غير معروف",
  "18:00-20:00 CEST": "18:00-20:00",
  "20:00-22:00 CEST": "20:00-22:00",
  "All blocks": "كل الأوقات",
  "cannot": "غير متاح",
};

export function ScheduleTable({ scheduleData, onAvailabilityChange, isLoading }: ScheduleTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const handleOpenChange = (key: string, isOpen: boolean) => {
    setOpenDropdowns(prev => {
      const next = new Set(prev);
      if (isOpen) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const groupedByRole = scheduleData.reduce((acc, player) => {
    if (!acc[player.role]) {
      acc[player.role] = [];
    }
    acc[player.role].push(player);
    return acc;
  }, {} as Record<string, PlayerAvailability[]>);

  const roleOrder = ["Tank", "DPS", "Support", "Sub", "Coach"];

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card" ref={tableRef}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="border-r border-primary-border px-4 py-3 text-right text-sm font-semibold uppercase tracking-wide">
                الدور
              </th>
              <th className="border-r border-primary-border px-4 py-3 text-right text-sm font-semibold uppercase tracking-wide min-w-[140px]">
                اللاعب
              </th>
              {dayOfWeek.map((day) => (
                <th
                  key={day}
                  className="border-r border-primary-border px-3 py-3 text-center text-sm font-semibold uppercase tracking-wide min-w-[160px] last:border-r-0"
                  data-testid={`header-${day.toLowerCase()}`}
                >
                  {day === "Monday" && "الإثنين"}
                  {day === "Tuesday" && "الثلاثاء"}
                  {day === "Wednesday" && "الأربعاء"}
                  {day === "Thursday" && "الخميس"}
                  {day === "Friday" && "الجمعة"}
                  {day === "Saturday" && "السبت"}
                  {day === "Sunday" && "الأحد"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roleOrder.map((role) => {
              const playersInRole = groupedByRole[role] || [];
              if (playersInRole.length === 0) return null;

              return playersInRole.map((player, index) => (
                <tr
                  key={player.playerId}
                  className="border-t border-border hover-elevate"
                  data-testid={`row-player-${player.playerId}`}
                >
                  <td className="border-r border-border px-4 py-3 bg-card">
                    <Badge
                      variant="secondary"
                      className={`${roleColors[role]} font-medium text-xs`}
                      data-testid={`badge-role-${player.playerId}`}
                    >
                      {role}
                    </Badge>
                  </td>
                  <td className="border-r border-border px-4 py-3 bg-card">
                    <span className="text-sm font-medium text-card-foreground" data-testid={`text-player-name-${player.playerId}`}>
                      {player.playerName}
                    </span>
                  </td>
                  {dayOfWeek.map((day) => {
                    const availability = player.availability[day];
                    const dropdownKey = `${player.playerId}-${day}`;
                    const isOpen = openDropdowns.has(dropdownKey);

                    return (
                      <td
                        key={day}
                        className="border-r border-border px-2 py-2 bg-card last:border-r-0"
                      >
                        <Select
                          value={availability}
                          onValueChange={(value: AvailabilityOption) =>
                            onAvailabilityChange(player.playerId, day, value)
                          }
                          disabled={isLoading}
                          onOpenChange={(open) => handleOpenChange(dropdownKey, open)}
                        >
                          <SelectTrigger
                            className={`w-full h-9 text-xs font-medium ${availabilityColors[availability]} border-0 focus:ring-1 focus:ring-ring`}
                            data-testid={`select-availability-${player.playerId}-${day.toLowerCase()}`}
                          >
                            <SelectValue>
                              <span className="block truncate">
                                {availabilityDisplayText[availability]}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {availabilityOptions.map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                                className="text-sm"
                                data-testid={`option-${option}`}
                              >
                                {availabilityDisplayText[option]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    );
                  })}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
      {scheduleData.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-sm">لا يوجد لاعبين في الجدول</p>
        </div>
      )}
    </div>
  );
}
