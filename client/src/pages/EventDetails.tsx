import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Event, EventResult, Game, InsertGame } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Save, Upload, Eye } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function EventDetails() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id || "";

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [eventResult, setEventResult] = useState<EventResult | "">("");
  const [opponentName, setOpponentName] = useState("");
  const [eventNotes, setEventNotes] = useState("");

  const [newGameCode, setNewGameCode] = useState("");
  const [newGameScore, setNewGameScore] = useState("");
  const [newGameImageUrl, setNewGameImageUrl] = useState("");

  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const response = await fetch(`/api/events`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const events: Event[] = await response.json();
      const foundEvent = events.find((e) => e.id === eventId);
      if (!foundEvent) throw new Error("Event not found");
      
      setEventResult((foundEvent.result as EventResult) || "");
      setOpponentName(foundEvent.opponentName || "");
      setEventNotes(foundEvent.notes || "");
      
      return foundEvent;
    },
  });

  const { data: games = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/events", eventId, "games"],
    enabled: !!eventId,
  });

  const updateEventMutation = useMutation({
    mutationFn: async (data: { result: string; opponentName: string; notes: string }) => {
      const response = await apiRequest("PUT", `/api/events/${eventId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      setToastMessage("Event details saved");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (error: any) => {
      setToastMessage(error.message || "Failed to save details");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  const addGameMutation = useMutation({
    mutationFn: async (data: InsertGame) => {
      const response = await apiRequest("POST", "/api/games", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "games"] });
      setNewGameCode("");
      setNewGameScore("");
      setNewGameImageUrl("");
      setToastMessage("Game added successfully");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (error: any) => {
      setToastMessage(error.message || "Failed to add game");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: async (data: { id: string; game: Partial<InsertGame> }) => {
      const response = await apiRequest("PUT", `/api/games/${data.id}`, data.game);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "games"] });
      setEditingGame(null);
      setToastMessage("Game updated successfully");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (error: any) => {
      setToastMessage(error.message || "Failed to update game");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/games/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "games"] });
      setToastMessage("Game deleted successfully");
      setToastType("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (error: any) => {
      setToastMessage(error.message || "Failed to delete game");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  const handleSaveEventDetails = () => {
    updateEventMutation.mutate({
      result: eventResult,
      opponentName: opponentName,
      notes: eventNotes,
    });
  };

  const handleAddGame = () => {
    if (!newGameCode.trim() || !newGameScore.trim()) {
      setToastMessage("Please enter game code and score");
      setToastType("error");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    addGameMutation.mutate({
      eventId: eventId,
      gameCode: newGameCode,
      score: newGameScore,
      imageUrl: newGameImageUrl.trim() || undefined,
    });
  };

  const handleUpdateGame = (game: Game) => {
    if (!editingGame) return;
    updateGameMutation.mutate({
      id: game.id,
      game: {
        gameCode: editingGame.gameCode,
        score: editingGame.score,
        imageUrl: editingGame.imageUrl || undefined,
      },
    });
  };

  const handleDeleteGame = (id: string) => {
    if (confirm("Are you sure you want to delete this game?")) {
      deleteGameMutation.mutate(id);
    }
  };

  const getResultBadgeVariant = (result: string) => {
    switch (result) {
      case "win":
        return "default";
      case "loss":
        return "destructive";
      case "draw":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case "win":
        return "Win";
      case "loss":
        return "Loss";
      case "draw":
        return "Draw";
      case "pending":
        return "Pending";
      default:
        return "Not Set";
    }
  };

  if (eventLoading || gamesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-lg">Event not found</div>
        <Link href="/events">
          <Button data-testid="button-back-to-events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {showToast && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
              toastType === "success" ? "bg-green-600" : "bg-red-600"
            } text-white`}
            data-testid="toast-message"
          >
            {toastMessage}
          </div>
        )}

        {viewingImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingImage(null)}
          >
            <div className="max-w-4xl max-h-full">
              <img
                src={viewingImage}
                alt="Scoreboard"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link href="/events">
            <Button variant="outline" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="text-event-title">
              {event.title}
            </CardTitle>
            <div className="flex gap-2 items-center flex-wrap">
              <Badge variant="outline" data-testid="badge-event-type">
                {event.eventType}
              </Badge>
              <Badge variant="outline" data-testid="badge-event-date">
                {format(new Date(event.date), "MMM dd, yyyy")}
              </Badge>
              {event.time && (
                <Badge variant="outline" data-testid="badge-event-time">
                  {event.time}
                </Badge>
              )}
              {event.result && (
                <Badge variant={getResultBadgeVariant(event.result)} data-testid="badge-event-result">
                  {getResultText(event.result)}
                </Badge>
              )}
            </div>
            {event.description && (
              <p className="text-sm text-muted-foreground mt-2" data-testid="text-event-description">
                {event.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Result</label>
              <Select
                value={eventResult}
                onValueChange={(value) => setEventResult(value as EventResult)}
              >
                <SelectTrigger data-testid="select-result">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="draw">Draw</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Opponent Name</label>
              <Input
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                placeholder="Enter opponent team name"
                data-testid="input-opponent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                placeholder="Enter any notes about the event..."
                rows={4}
                data-testid="textarea-notes"
              />
            </div>

            <Button
              onClick={handleSaveEventDetails}
              disabled={updateEventMutation.isPending}
              data-testid="button-save-details"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateEventMutation.isPending ? "Saving..." : "Save Details"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Games & Scoreboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Add New Game</label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  value={newGameCode}
                  onChange={(e) => setNewGameCode(e.target.value)}
                  placeholder="Game Code"
                  data-testid="input-new-game-code"
                />
                <Input
                  value={newGameScore}
                  onChange={(e) => setNewGameScore(e.target.value)}
                  placeholder="Score (e.g., 2-1)"
                  data-testid="input-new-game-score"
                />
                <Input
                  value={newGameImageUrl}
                  onChange={(e) => setNewGameImageUrl(e.target.value)}
                  placeholder="Image URL (optional)"
                  data-testid="input-new-game-image"
                />
                <Button
                  onClick={handleAddGame}
                  disabled={addGameMutation.isPending}
                  data-testid="button-add-game"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {games.length === 0 ? (
              <div className="text-center text-muted-foreground py-8" data-testid="text-no-games">
                No games recorded
              </div>
            ) : (
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left font-semibold">Game Code</th>
                      <th className="p-3 text-left font-semibold">Score</th>
                      <th className="p-3 text-left font-semibold">Scoreboard Image</th>
                      <th className="p-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game) => (
                      <tr key={game.id} className="border-t hover-elevate" data-testid={`row-game-${game.id}`}>
                        <td className="p-3">
                          {editingGame?.id === game.id ? (
                            <Input
                              value={editingGame.gameCode}
                              onChange={(e) =>
                                setEditingGame({ ...editingGame, gameCode: e.target.value })
                              }
                              data-testid={`input-edit-code-${game.id}`}
                            />
                          ) : (
                            <span data-testid={`text-game-code-${game.id}`}>{game.gameCode}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingGame?.id === game.id ? (
                            <Input
                              value={editingGame.score}
                              onChange={(e) =>
                                setEditingGame({ ...editingGame, score: e.target.value })
                              }
                              data-testid={`input-edit-score-${game.id}`}
                            />
                          ) : (
                            <span data-testid={`text-game-score-${game.id}`}>{game.score}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingGame?.id === game.id ? (
                            <Input
                              value={editingGame.imageUrl || ""}
                              onChange={(e) =>
                                setEditingGame({ ...editingGame, imageUrl: e.target.value })
                              }
                              placeholder="Image URL"
                              data-testid={`input-edit-image-${game.id}`}
                            />
                          ) : game.imageUrl ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingImage(game.imageUrl || null)}
                              data-testid={`button-view-image-${game.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">No image</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 flex-wrap">
                            {editingGame?.id === game.id ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateGame(game)}
                                  disabled={updateGameMutation.isPending}
                                  data-testid={`button-save-game-${game.id}`}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingGame(null)}
                                  data-testid={`button-cancel-edit-${game.id}`}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingGame(game)}
                                  data-testid={`button-edit-game-${game.id}`}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteGame(game.id)}
                                  disabled={deleteGameMutation.isPending}
                                  data-testid={`button-delete-game-${game.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
