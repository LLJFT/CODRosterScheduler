import { CheckCircle2, AlertCircle, Cloud, CloudOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SyncStatusProps {
  isSyncing: boolean;
  lastSyncTime?: Date;
  hasError?: boolean;
  errorMessage?: string;
}

export function SyncStatus({ isSyncing, lastSyncTime, hasError, errorMessage }: SyncStatusProps) {
  if (isSyncing) {
    return (
      <div className="flex items-center gap-2" data-testid="sync-status-syncing">
        <Cloud className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">Syncing...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-2" data-testid="sync-status-error">
        <Badge variant="destructive" className="gap-1.5">
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">{errorMessage || "Sync error"}</span>
        </Badge>
      </div>
    );
  }

  if (lastSyncTime) {
    const timeAgo = getTimeAgo(lastSyncTime);
    return (
      <div className="flex items-center gap-2" data-testid="sync-status-success">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="text-sm text-muted-foreground">
          Last synced: {timeAgo}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" data-testid="sync-status-idle">
      <CloudOff className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Not connected</span>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
