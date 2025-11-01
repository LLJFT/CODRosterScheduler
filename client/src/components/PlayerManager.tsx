import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { roleTypes, type RoleType } from "@shared/schema";
import type { PlayerAvailability } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface PlayerManagerProps {
  players: PlayerAvailability[];
  onAddPlayer: (name: string, role: RoleType) => void;
  onRemovePlayer: (playerId: string) => void;
}

const roleColors: Record<string, string> = {
  Tank: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-500/20",
  DPS: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/20",
  Support: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300 border-green-500/20",
  Sub: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 border-yellow-500/20",
  Coach: "bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/20",
};

const roleDisplayNames: Record<RoleType, string> = {
  Tank: "دبابة",
  DPS: "مهاجم",
  Support: "دعم",
  Sub: "بديل",
  Coach: "مدرب",
};

export function PlayerManager({ players, onAddPlayer, onRemovePlayer }: PlayerManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<RoleType>("Tank");

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim(), newPlayerRole);
      setNewPlayerName("");
      setNewPlayerRole("Tank");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2" data-testid="button-add-player">
          <Plus className="h-4 w-4" />
          إدارة اللاعبين
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إدارة اللاعبين</DialogTitle>
          <DialogDescription>
            أضف لاعبين جدد أو احذف لاعبين موجودين
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">اسم اللاعب</Label>
              <Input
                id="player-name"
                placeholder="أدخل اسم اللاعب"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                data-testid="input-player-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="player-role">الدور</Label>
              <Select value={newPlayerRole} onValueChange={(v) => setNewPlayerRole(v as RoleType)}>
                <SelectTrigger id="player-role" data-testid="select-player-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleTypes.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleDisplayNames[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim()}
              className="w-full"
              data-testid="button-confirm-add-player"
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة لاعب
            </Button>
          </div>

          {players.length > 0 && (
            <div className="space-y-2">
              <Label>اللاعبون الحاليون</Label>
              <div className="max-h-[300px] overflow-y-auto space-y-2 rounded-md border border-border p-3">
                {players.map((player) => (
                  <div
                    key={player.playerId}
                    className="flex items-center justify-between p-2 rounded-md hover-elevate border border-border"
                    data-testid={`player-item-${player.playerId}`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={`${roleColors[player.role]} text-xs`}>
                        {roleDisplayNames[player.role]}
                      </Badge>
                      <span className="text-sm font-medium">{player.playerName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemovePlayer(player.playerId)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      data-testid={`button-remove-player-${player.playerId}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} data-testid="button-close-dialog">
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
