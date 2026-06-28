export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["bg-white rounded-2xl border border-slate-200", className].join(" ")}>
      {children}
    </div>
  );
}
