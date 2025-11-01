import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface SimpleToastProps {
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose: () => void;
}

export function SimpleToast({ message, type = "success", duration = 3000, onClose }: SimpleToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[200] transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
      data-testid="toast-notification"
    >
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border ${
          type === "success"
            ? "bg-background border-primary text-foreground"
            : "bg-destructive border-destructive-border text-destructive-foreground"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive-foreground flex-shrink-0" />
        )}
        <div className="text-sm font-medium" data-testid="toast-title">
          {message}
        </div>
      </div>
    </div>
  );
}
