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
import { Plus, Trash2, Pencil } from "lucide-react";
import { roleTypes, type RoleType } from "@shared/schema";
import type { PlayerAvailability } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface PlayerManagerProps {
  players: PlayerAvailability[];
  onAddPlayer: (name: string, role: RoleType) => void;
  onRemovePlayer: (playerId: string) => void;
  onEditPlayer: (playerId: string, name: string, role: RoleType) => void;
}

/** نفس ألوان الرولات المستخدمة في ScheduleTable.tsx */
const roleColors: Record<string, string> = {
  AR: "bg-blue-600 text-white border-blue-500",
  SUB: "bg-emerald-600 text-white border-emerald-500",
  FLEX: "bg-purple-600 text-white border-purple-500",
  MANAGER: "bg-slate-600 text-white border-slate-500",
  COACH: "bg-amber-400 text-black border-amber-300",
};

const roleDisplayNames: Record<RoleType, string> = {
  AR: "AR",
  SUB: "SUB",
  FLEX: "FLEX",
  MANAGER: "Manager",
  COACH: "Coach",
};

export function PlayerManager({
  players,
  onAddPlayer,
  onRemovePlayer,
  onEditPlayer,
}: PlayerManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<RoleType>("AR");
  const [editingPlayer, setEditingPlayer] = useState<PlayerAvailability | null>(
    null
  );

  const handleAddOrUpdate = () => {
    if (!newPlayerName.trim()) return;

    if (editingPlayer) {
      onEditPlayer(editingPlayer.playerId, newPlayerName.trim(), newPlayerRole);
    } else {
      onAddPlayer(newPlayerName.trim(), newPlayerRole);
    }

    setNewPlayerName("");
    setNewPlayerRole("AR");
    setEditingPlayer(null);
    setIsOpen(false);
  };

  const handleEditClick = (player: PlayerAvailability) => {
    setEditingPlayer(player);
    setNewPlayerName(player.playerName);
    setNewPlayerRole(player.role);
    setIsOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingPlayer(null);
      setNewPlayerName("");
      setNewPlayerRole("AR");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="gap-2"
          data-testid="button-add-player"
        >
          <Plus className="h-4 w-4" />
          Manage Players
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingPlayer ? "Edit Player" : "Manage Players"}
          </DialogTitle>
          <DialogDescription>
            {editingPlayer
              ? "Edit player name and role."
              : "Add new players or remove existing ones."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Player Name</Label>
              <Input
                id="player-name"
                placeholder="Enter player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddOrUpdate()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="player-role">Role</Label>
              <Select
                value={newPlayerRole}
                onValueChange={(value) => setNewPlayerRole(value as RoleType)}
              >
                <SelectTrigger id="player-role">
                  <SelectValue placeholder="Select role" />
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
              onClick={handleAddOrUpdate}
              disabled={!newPlayerName.trim()}
              className="w-full"
            >
              {editingPlayer ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Update Player
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Player
                </>
              )}
            </Button>
          </div>

          {/* Players list */}
          {!editingPlayer && players.length > 0 && (
            <div className="space-y-2">
              <Label>Current Players</Label>
              <div className="max-h-[300px] overflow-y-auto space-y-2 rounded-md border border-border p-3">
                {players.map((player) => (
                  <div
                    key={player.playerId}
                    className="flex items-center justify-between p-2 rounded-md hover-elevate border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs border ${roleColors[player.role]}`}
                      >
                        {roleDisplayNames[player.role]}
                      </Badge>
                      <span className="text-sm font-medium">
                        {player.playerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(player)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemovePlayer(player.playerId)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}