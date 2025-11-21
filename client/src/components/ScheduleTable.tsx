import { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { PlayerAvailability, DayOfWeek, AvailabilityOption, RoleType } from "@shared/schema";
import { dayOfWeek, availabilityOptions } from "@shared/schema";

interface ScheduleTableProps {
  scheduleData: PlayerAvailability[];
  onAvailabilityChange: (playerId: string, day: DayOfWeek, availability: AvailabilityOption) => void;
  onRoleChange?: (playerId: string, role: RoleType) => void;
  onPlayerNameChange?: (playerId: string, name: string) => void;
  isLoading?: boolean;
}

const roleColors: Record<string, string> = {
  Tank: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-500/20",
  DPS: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/20",
  Support: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20",
  Analyst: "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/20",
  Coach: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 border-yellow-500/20",
};

const roleDisplayNames: Record<string, string> = {
  Tank: "Tank",
  DPS: "DPS",
  Support: "Support",
  Analyst: "Analyst",
  Coach: "Coach",
};

const availabilityColors: Record<AvailabilityOption, string> = {
  "unknown": "bg-muted text-muted-foreground",
  "18:00-20:00 CEST": "bg-primary/10 text-primary dark:bg-primary/20",
  "20:00-22:00 CEST": "bg-primary/10 text-primary dark:bg-primary/20",
  "All blocks": "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  "cannot": "bg-destructive/10 text-destructive dark:bg-destructive/20",
};

const availabilityDisplayText: Record<AvailabilityOption, string> = {
  "unknown": "unknown",
  "18:00-20:00 CEST": "18:00-20:00",
  "20:00-22:00 CEST": "20:00-22:00",
  "All blocks": "All blocks",
  "cannot": "cannot",
};

export function ScheduleTable({ scheduleData, onAvailabilityChange, onRoleChange, onPlayerNameChange, isLoading }: ScheduleTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>("");

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

  const handleNameEdit = (playerId: string, currentName: string) => {
    setEditingName(playerId);
    setEditedName(currentName);
  };

  const handleNameSave = (playerId: string) => {
    if (editedName.trim() && onPlayerNameChange) {
      onPlayerNameChange(playerId, editedName.trim());
    }
    setEditingName(null);
    setEditedName("");
  };

  const handleNameCancel = () => {
    setEditingName(null);
    setEditedName("");
  };

  const groupedByRole = scheduleData.reduce((acc, player) => {
    if (!acc[player.role]) {
      acc[player.role] = [];
    }
    acc[player.role].push(player);
    return acc;
  }, {} as Record<string, PlayerAvailability[]>);

  const roleOrder = ["Tank", "DPS", "Support", "Analyst", "Coach"];

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card" ref={tableRef}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="border-r border-primary-border px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide">
                Role
              </th>
              <th className="border-r border-primary-border px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide min-w-[140px]">
                Player
              </th>
              {dayOfWeek.map((day) => (
                <th
                  key={day}
                  className="border-r border-primary-border px-3 py-3 text-center text-sm font-semibold uppercase tracking-wide min-w-[160px] last:border-r-0"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roleOrder.map((role) => {
              const playersInRole = groupedByRole[role] || [];
              if (playersInRole.length === 0) return null;

              return playersInRole.map((player) => (
                <tr
                  key={player.playerId}
                  className="border-t border-border hover-elevate"
                >
                  <td className="border-r border-border px-2 py-2 bg-card">
                    <Select
                      value={player.role}
                      onValueChange={(value: RoleType) => {
                        if (onRoleChange) {
                          onRoleChange(player.playerId, value);
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        className={`w-full h-9 text-xs font-medium ${roleColors[role]} border-0`}
                      >
                        <SelectValue>
                          {roleDisplayNames[player.role]}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Tank">Tank</SelectItem>
                        <SelectItem value="DPS">DPS</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                        <SelectItem value="Analyst">Analyst</SelectItem>
                        <SelectItem value="Coach">Coach</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  <td className="border-r border-border px-2 py-2 bg-card">
                    {editingName === player.playerId ? (
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onBlur={() => handleNameSave(player.playerId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleNameSave(player.playerId);
                          if (e.key === "Escape") handleNameCancel();
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => handleNameEdit(player.playerId, player.playerName)}
                        className="cursor-pointer px-2 py-1 rounded-md hover:bg-accent/50"
                      >
                        {player.playerName}
                      </div>
                    )}
                  </td>

                  {dayOfWeek.map((day) => {
                    const availability = player.availability[day];
                    const dropdownKey = `${player.playerId}-${day}`;

                    return (
                      <td key={day} className="border-r border-border px-2 py-2 bg-card">
                        <Select
                          value={availability}
                          onValueChange={(value: AvailabilityOption) =>
                            onAvailabilityChange(player.playerId, day, value)
                          }
                          disabled={isLoading}
                          onOpenChange={(open) => handleOpenChange(dropdownKey, open)}
                        >
                          <SelectTrigger
                            className={`w-full h-9 text-xs font-medium ${availabilityColors[availability]} border-0`}
                          >
                            <SelectValue>
                              <span className="truncate">
                                {availabilityDisplayText[availability]}
                              </span>
                            </SelectValue>
                          </SelectTrigger>

                          <SelectContent>
                            {availabilityOptions.map((option) => (
                              <SelectItem key={option} value={option}>
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
        <div className="py-12 text-center text-muted-foreground">
          No players in the schedule
        </div>
      )}
    </div>
  );
}
