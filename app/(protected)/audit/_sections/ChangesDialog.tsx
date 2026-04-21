import { AuditResponce } from "@/lib/audit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
const ACTION_KEYWORDS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CREATED:  "default",
  UPDATED:  "secondary",
  DELETED:  "destructive",
  STARTED:  "secondary",
  FINISHED: "outline",
  RELEASED: "outline",
  ACCEPTED: "default",
  REJECTED: "destructive",
  ADDED:    "default",
  REMOVED:  "destructive",
};

function actionVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  const key = Object.keys(ACTION_KEYWORDS).find((k) => action.includes(k));
  return key ? ACTION_KEYWORDS[key] : "outline";
}

function parseChanges(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const outer = JSON.parse(raw) as Record<string, unknown>;

    const inner = Object.values(outer)[0];
    return (inner && typeof inner === "object" ? inner : outer) as Record<
      string,
      unknown
    >;
  } catch {
    return {};
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ChangesDialog = ({ item }: { item: AuditResponce }) => {
  const fields = parseChanges(item.changes);
  const entries = Object.entries(fields);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          />
        }
      >
        <FileText size={14} />
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant={actionVariant(item.action)}>{item.action}</Badge>
            <span className="text-sm font-normal text-muted-foreground">
              {fmtDate(item.createdAt)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 pt-1">
          <div className="flex justify-between py-1.5 text-xs text-muted-foreground border-b mb-2">
            <span>Entity ID</span>
            <span className="font-mono">
              {item.entityId?.slice(0, 8).toUpperCase() ?? "—"}
            </span>
          </div>
          {entries.length === 0 ?
            <p className="text-sm text-muted-foreground py-4 text-center">
              No changes recorded
            </p>
          : entries.map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between gap-4 py-1.5 border-b last:border-0"
              >
                <span className="text-sm text-muted-foreground shrink-0 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="text-sm font-medium text-right break-all">
                  {value === null || value === undefined ?
                    "—"
                  : typeof value === "object" ?
                    JSON.stringify(value)
                  : String(value)}
                </span>
              </div>
            ))
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ChangesDialog;
