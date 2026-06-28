const MAP = {
  critical: "text-red-700 bg-red-50 border-red-200",
  high:     "text-orange-700 bg-orange-50 border-orange-200",
  medium:   "text-amber-700 bg-amber-50 border-amber-200",
  low:      "text-blue-700 bg-blue-50 border-blue-200",
} as const;

export function SeverityBadge({ severity }: { severity: keyof typeof MAP }) {
  return (
    <span className={["text-xs font-semibold px-2 py-0.5 rounded-full border capitalize", MAP[severity]].join(" ")}>
      {severity}
    </span>
  );
}
