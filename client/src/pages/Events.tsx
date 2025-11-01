import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { EventDialog } from "@/components/EventDialog";
import { SimpleToast } from "@/components/SimpleToast";
import "./events-calendar.css";

export default function Events() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("DELETE", `/api/events/${eventId}`, null);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setToastMessage("Event deleted successfully");
      setToastType("success");
      setShowToast(true);
    },
    onError: (error: any) => {
      setToastMessage(error.message || "Error deleting event");
      setToastType("error");
      setShowToast(true);
    },
  });

  const getEventsForDate = (date: Date | undefined) => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((event) => event.date === dateStr);
  };

  const getDatesWithEvents = () => {
    return events.map((event) => new Date(event.date));
  };

  const getEventsByDateMap = () => {
    const map: Record<string, Event[]> = {};
    events.forEach((event) => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    return map;
  };

  const eventsForSelectedDate = getEventsForDate(selectedDate);
  const datesWithEvents = getDatesWithEvents();
  const eventsByDate = getEventsByDateMap();

  const getEventTypeBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case "Tournament":
        return "default";
      case "Scrim":
        return "secondary";
      case "VOD Review":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6" dir="ltr">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
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
            <h1 className="text-3xl font-bold text-foreground">Team Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage tournaments, scrims, and VOD reviews
            </p>
          </div>
          <Button
            onClick={() => setShowEventDialog(true)}
            data-testid="button-add-event"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-8">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Calendar</h2>
            <div className="calendar-large">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  hasEvent: datesWithEvents,
                }}
                modifiersStyles={{
                  hasEvent: {
                    fontWeight: "bold",
                  },
                }}
                className="rounded-md border w-full"
                data-testid="calendar-events"
                components={{
                  DayContent: ({ date }) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const dayEvents = eventsByDate[dateStr] || [];
                    return (
                      <div className="w-full h-full flex flex-col items-center justify-start p-1">
                        <div className="text-sm mb-1">{format(date, "d")}</div>
                        <div className="flex flex-col gap-0.5 w-full">
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div
                              key={idx}
                              className="text-[9px] px-1 py-0.5 rounded truncate w-full"
                              style={{
                                backgroundColor:
                                  event.eventType === "Tournament"
                                    ? "hsl(var(--primary))"
                                    : event.eventType === "Scrim"
                                    ? "hsl(var(--secondary))"
                                    : "hsl(var(--accent))",
                                color:
                                  event.eventType === "Tournament"
                                    ? "hsl(var(--primary-foreground))"
                                    : event.eventType === "Scrim"
                                    ? "hsl(var(--secondary-foreground))"
                                    : "hsl(var(--accent-foreground))",
                              }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[8px] text-muted-foreground text-center">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  },
                }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h2>

            {isLoading ? (
              <div className="text-muted-foreground">Loading events...</div>
            ) : eventsForSelectedDate.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No events scheduled for this date
              </div>
            ) : (
              <div className="space-y-3">
                {eventsForSelectedDate.map((event) => (
                  <Card
                    key={event.id}
                    className="p-4 hover-elevate"
                    data-testid={`card-event-${event.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={getEventTypeBadgeVariant(event.eventType)}
                            data-testid={`badge-event-type-${event.id}`}
                          >
                            {event.eventType}
                          </Badge>
                          {event.time && (
                            <span className="text-sm text-muted-foreground">
                              {event.time}
                            </span>
                          )}
                        </div>
                        <h3
                          className="font-semibold text-foreground"
                          data-testid={`text-event-title-${event.id}`}
                        >
                          {event.title}
                        </h3>
                        {event.description && (
                          <p
                            className="text-sm text-muted-foreground mt-1"
                            data-testid={`text-event-description-${event.id}`}
                          >
                            {event.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(event.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-event-${event.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {showEventDialog && (
        <EventDialog
          open={showEventDialog}
          onOpenChange={setShowEventDialog}
          selectedDate={selectedDate}
          onSuccess={(message: string) => {
            setToastMessage(message);
            setToastType("success");
            setShowToast(true);
          }}
        />
      )}

      {showToast && (
        <SimpleToast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
