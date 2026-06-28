import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  color: "blue" | "red" | "green" | "amber";
};

const COLOR = {
  blue:  { bg: "bg-brand-50",   icon: "text-brand-600",  ring: "bg-brand-100" },
  red:   { bg: "bg-red-50",     icon: "text-red-600",    ring: "bg-red-100"   },
  green: { bg: "bg-green-50",   icon: "text-green-600",  ring: "bg-green-100" },
  amber: { bg: "bg-amber-50",   icon: "text-amber-600",  ring: "bg-amber-100" },
};

export function StatCard({ label, value, icon: Icon, trend, color }: Props) {
  const c = COLOR[color];
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-4")}>
      <div className={cn("p-2.5 rounded-xl", c.ring)}>
        <Icon className={cn("w-5 h-5", c.icon)} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{trend}</p>
      </div>
    </div>
  );
}
