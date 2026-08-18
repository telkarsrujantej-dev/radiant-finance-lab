import { Bell, AlertTriangle, Info, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFinance } from "@/lib/finance-store";
import { buildNotifications } from "@/lib/finance-selectors";
import { periodFromPreset } from "@/lib/finance-data";
import { cn } from "@/lib/utils";

const ICONS = { warning: AlertTriangle, success: PiggyBank, info: Info } as const;

export function NotificationBell() {
  const { state } = useFinance();
  const items = buildNotifications(state, periodFromPreset("this-month"));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-xl border-border/70">
          <Bell className="h-[18px] w-[18px]" />
          {items.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {items.length}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] rounded-2xl p-2">
        <DropdownMenuLabel className="font-display">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[340px] space-y-1 overflow-y-auto">
          {items.map((n) => {
            const Icon = ICONS[n.tone];
            return (
              <div key={n.id} className="flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-accent">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    n.tone === "warning" && "bg-danger/12 text-danger",
                    n.tone === "success" && "bg-success/12 text-success",
                    n.tone === "info" && "bg-accent text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
