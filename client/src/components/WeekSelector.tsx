import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { format, addWeeks, startOfWeek, endOfWeek } from "date-fns";

interface WeekSelectorProps {
  weekStart: Date;
  weekEnd: Date;
  onWeekChange: (start: Date, end: Date) => void;
}

export function WeekSelector({ weekStart, weekEnd, onWeekChange }: WeekSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePreviousWeek = () => {
    const newStart = addWeeks(weekStart, -1);
    const newEnd = endOfWeek(newStart, { weekStartsOn: 1 });
    onWeekChange(newStart, newEnd);
  };

  const handleNextWeek = () => {
    const newStart = addWeeks(weekStart, 1);
    const newEnd = endOfWeek(newStart, { weekStartsOn: 1 });
    onWeekChange(newStart, newEnd);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newStart = startOfWeek(date, { weekStartsOn: 1 });
      const newEnd = endOfWeek(date, { weekStartsOn: 1 });
      onWeekChange(newStart, newEnd);
      setIsOpen(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "dd.MM");
  };

  return (
    <div className="flex items-center gap-3" data-testid="week-selector">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousWeek}
        className="h-9 w-9"
        data-testid="button-previous-week"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[280px] justify-center gap-2 font-semibold text-base"
            data-testid="button-week-display"
          >
            <CalendarIcon className="h-4 w-4" />
            <span>
              {formatDate(weekStart)} - {formatDate(weekEnd)}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={weekStart}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextWeek}
        className="h-9 w-9"
        data-testid="button-next-week"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
