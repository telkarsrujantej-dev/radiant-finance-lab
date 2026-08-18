import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  MONTH_NAMES,
  monthPeriod,
  periodFromPreset,
  periodLabel,
  type Period,
} from "@/lib/finance-data";

const PRESETS = [
  { key: "this-month", label: "This Month" },
  { key: "last-month", label: "Last Month" },
  { key: "this-year", label: "This Year" },
  { key: "last-year", label: "Last Year" },
] as const;

export function PeriodFilter({
  period,
  onChange,
  className,
}: {
  period: Period;
  onChange: (p: Period) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  const year = Number(period.from.slice(0, 4));

  const pick = (p: Period) => {
    onChange(p);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("gap-2 rounded-xl border-border/70", className)}
        >
          <CalendarDays className="h-4 w-4" />
          <span className="text-sm font-medium">{periodLabel(period)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px] rounded-2xl p-4">
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant={period.preset === p.key ? "default" : "outline"}
              className="rounded-lg"
              onClick={() => pick(periodFromPreset(p.key))}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <p className="mt-4 mb-2 text-xs font-medium text-muted-foreground">Specific month · {year}</p>
        <div className="grid grid-cols-4 gap-1.5">
          {MONTH_NAMES.map((m, i) => (
            <Button
              key={m}
              size="sm"
              variant="ghost"
              className="h-8 rounded-lg px-0 text-xs"
              onClick={() => pick(monthPeriod(year, i))}
            >
              {m.slice(0, 3)}
            </Button>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
          <Label className="text-xs text-muted-foreground">Custom range</Label>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 text-xs"
            />
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <Button
            size="sm"
            className="w-full rounded-lg"
            onClick={() => from <= to && pick({ preset: "custom", from, to })}
          >
            Apply range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
