type Color = "blue" | "green" | "red" | "amber" | "slate";
const C: Record<Color, string> = {
  blue:  "text-brand-700 bg-brand-50 border-brand-200",
  green: "text-green-700 bg-green-50 border-green-200",
  red:   "text-red-700 bg-red-50 border-red-200",
  amber: "text-amber-700 bg-amber-50 border-amber-200",
  slate: "text-slate-600 bg-slate-50 border-slate-200",
};
export function Badge({ children, color = "slate" }: { children: React.ReactNode; color?: Color }) {
  return (
    <span className={["text-xs font-medium px-2 py-0.5 rounded-full border", C[color]].join(" ")}>
      {children}
    </span>
  );
}
