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
        <span className="text-sm text-muted-foreground">جارٍ المزامنة...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center gap-2" data-testid="sync-status-error">
        <Badge variant="destructive" className="gap-1.5">
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">{errorMessage || "خطأ في المزامنة"}</span>
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
          آخر مزامنة: {timeAgo}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" data-testid="sync-status-idle">
      <CloudOff className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">غير متصل</span>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "الآن";
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
  return `منذ ${Math.floor(seconds / 86400)} يوم`;
}
