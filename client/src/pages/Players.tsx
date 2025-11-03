import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ArrowLeft, Check, X } from "lucide-react";
import { format } from "date-fns";
import type { Player, Attendance, AttendanceStatus } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SimpleToast } from "@/components/SimpleToast";

const playerFormSchema = z.object({
  name: z.string().min(1, "Nickname is required"),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  snapchat: z.string().optional(),
  role: z.enum(["Tank", "DPS", "Support"]),
});

const attendanceFormSchema = z.object({
  playerId: z.string().min(1, "Player is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["attended", "late", "absent"]),
  notes: z.string().optional(),
});

type PlayerFormData = z.infer<typeof playerFormSchema>;
type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

export default function Players() {
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>();
  const [editingAttendance, setEditingAttendance] = useState<Attendance | undefined>();
  const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: allAttendance = [], isLoading: attendanceLoading } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance"],
  });

  const playerForm = useForm<PlayerFormData>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      name: "",
      fullName: "",
      phone: "",
      snapchat: "",
      role: "DPS",
    },
  });

  const attendanceForm = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      playerId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      status: "attended",
      notes: "",
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async (data: { id: string; player: Partial<PlayerFormData> }) => {
      const response = await apiRequest("PUT", `/api/players/${data.id}`, data.player);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setShowPlayerDialog(false);
      setEditingPlayer(undefined);
      playerForm.reset();
      setToastMessage("Player updated successfully");
      setToastType("success");
      setShowToast(true);
    },
    onError: (error: any) => {
      setToastMessage(error.message || "Failed to update player");
      setToastType("error");
      setShowToast(true);
    },
  });

  const createAttendanceMutation = useMutation({
    mutationFn: async (data: AttendanceFormData) => {
      const response = await apiRequest("POST", "/api/attendance", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setShowAttendanceDialog(false);
      setEditingAttendance(undefined);
      attendanceForm.reset();
      setToastMessage("Attendance record added successfully");
      setToastType("success");
      setShowToast(true);
    },
    onError: (error: any) => {
      setToastMessage(error.message || "Failed to add attendance");
      setToastType("error");
      setShowToast(true);
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: async (data: { id: string; attendance: Partial<AttendanceFormData> }) => {
      const response = await apiRequest("PUT", `/api/attendance/${data.id}`, data.attendance);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setShowAttendanceDialog(false);
      setEditingAttendance(undefined);
      attendanceForm.reset();
      setToastMessage("Attendance record updated successfully");
      setToastType("success");
      setShowToast(true);
    },
    onError: (error: any) => {
      setToastMessage(error.message || "Failed to update attendance");
      setToastType("error");
      setShowToast(true);
    },
  });

  const deleteAttendanceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/attendance/${id}`, null);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setToastMessage("Attendance record deleted successfully");
      setToastType("success");
      setShowToast(true);
    },
    onError: (error: any) => {
      setToastMessage(error.message || "Failed to delete attendance");
      setToastType("error");
      setShowToast(true);
    },
  });

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    playerForm.reset({
      name: player.name,
      fullName: player.fullName || "",
      phone: player.phone || "",
      snapchat: player.snapchat || "",
      role: player.role as "Tank" | "DPS" | "Support",
    });
    setShowPlayerDialog(true);
  };

  const handlePlayerSubmit = (data: PlayerFormData) => {
    if (editingPlayer) {
      updatePlayerMutation.mutate({ id: editingPlayer.id, player: data });
    }
  };

  const handleAddAttendance = (playerId?: string) => {
    setEditingAttendance(undefined);
    attendanceForm.reset({
      playerId: playerId || "",
      date: format(new Date(), "yyyy-MM-dd"),
      status: "attended",
      notes: "",
    });
    setShowAttendanceDialog(true);
  };

  const handleEditAttendance = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    attendanceForm.reset({
      playerId: attendance.playerId,
      date: attendance.date,
      status: attendance.status as AttendanceStatus,
      notes: attendance.notes || "",
    });
    setShowAttendanceDialog(true);
  };

  const handleAttendanceSubmit = (data: AttendanceFormData) => {
    if (editingAttendance) {
      updateAttendanceMutation.mutate({ id: editingAttendance.id, attendance: data });
    } else {
      createAttendanceMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "attended") {
      return <Badge className="bg-green-600 text-white" data-testid={`badge-status-${status}`}>Attended</Badge>;
    } else if (status === "late") {
      return <Badge className="bg-yellow-600 text-white" data-testid={`badge-status-${status}`}>Late</Badge>;
    } else {
      return <Badge className="bg-red-600 text-white" data-testid={`badge-status-${status}`}>Absent</Badge>;
    }
  };

  const getPlayerAttendance = (playerId: string) => {
    return allAttendance.filter(a => a.playerId === playerId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/">
              <Button
                variant="ghost"
                className="gap-2 mb-2"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Schedule
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Player Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage player information and attendance records
            </p>
          </div>
          <Button
            onClick={() => handleAddAttendance()}
            data-testid="button-add-attendance"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Attendance
          </Button>
        </div>

        {playersLoading ? (
          <div className="text-muted-foreground">Loading players...</div>
        ) : (
          <div className="space-y-6">
            {players.map((player) => (
              <Card key={player.id} className="p-6" data-testid={`card-player-${player.id}`}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-foreground">{player.name}</h2>
                        <Badge data-testid={`badge-role-${player.id}`}>{player.role}</Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditPlayer(player)}
                          data-testid={`button-edit-player-${player.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Full Name:</span>
                          <p className="text-foreground font-medium">{player.fullName || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <p className="text-foreground font-medium">{player.phone || "—"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Snapchat:</span>
                          <p className="text-foreground font-medium">{player.snapchat || "—"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddAttendance(player.id)}
                      data-testid={`button-add-attendance-${player.id}`}
                      className="gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      Add Attendance
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Attendance Records</h3>
                    
                    {getPlayerAttendance(player.id).length === 0 ? (
                      <div className="text-muted-foreground text-center py-4">
                        No attendance records yet
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3 text-foreground font-semibold">Date</th>
                              <th className="text-left p-3 text-foreground font-semibold">Status</th>
                              <th className="text-left p-3 text-foreground font-semibold">Notes</th>
                              <th className="text-left p-3 text-foreground font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPlayerAttendance(player.id)
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((attendance) => (
                              <tr key={attendance.id} className="border-b hover-elevate" data-testid={`row-attendance-${attendance.id}`}>
                                <td className="p-3 text-foreground">{format(new Date(attendance.date), "MMM d, yyyy")}</td>
                                <td className="p-3">{getStatusBadge(attendance.status)}</td>
                                <td className="p-3 text-muted-foreground">{attendance.notes || "—"}</td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleEditAttendance(attendance)}
                                      data-testid={`button-edit-attendance-${attendance.id}`}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => deleteAttendanceMutation.mutate(attendance.id)}
                                      data-testid={`button-delete-attendance-${attendance.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog}>
          <DialogContent data-testid="dialog-player">
            <DialogHeader>
              <DialogTitle>{editingPlayer ? "Edit Player" : "Add Player"}</DialogTitle>
            </DialogHeader>
            <Form {...playerForm}>
              <form onSubmit={playerForm.handleSubmit(handlePlayerSubmit)} className="space-y-4">
                <FormField
                  control={playerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nickname</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-player-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={playerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-player-fullname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={playerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-player-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={playerForm.control}
                  name="snapchat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Snapchat</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-player-snapchat" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={playerForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-player-role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Tank">Tank</SelectItem>
                          <SelectItem value="DPS">DPS</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPlayerDialog(false)}
                    data-testid="button-cancel-player"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updatePlayerMutation.isPending}
                    data-testid="button-save-player"
                  >
                    {updatePlayerMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
          <DialogContent data-testid="dialog-attendance">
            <DialogHeader>
              <DialogTitle>{editingAttendance ? "Edit Attendance" : "Add Attendance"}</DialogTitle>
            </DialogHeader>
            <Form {...attendanceForm}>
              <form onSubmit={attendanceForm.handleSubmit(handleAttendanceSubmit)} className="space-y-4">
                <FormField
                  control={attendanceForm.control}
                  name="playerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-attendance-player">
                            <SelectValue placeholder="Select player" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {players.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name} ({player.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={attendanceForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-attendance-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={attendanceForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-attendance-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="attended">Attended</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={attendanceForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-attendance-notes" placeholder="Why late/absent?" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAttendanceDialog(false)}
                    data-testid="button-cancel-attendance"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createAttendanceMutation.isPending || updateAttendanceMutation.isPending}
                    data-testid="button-save-attendance"
                  >
                    {createAttendanceMutation.isPending || updateAttendanceMutation.isPending
                      ? "Saving..."
                      : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {showToast && (
          <SimpleToast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
}
