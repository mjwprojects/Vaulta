"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AlertsActions({ alertId }: { alertId: string }) {
  const [loading, setLoading] = useState<"ack" | "resolve" | null>(null);
  const router = useRouter();

  async function update(status: "acknowledged" | "resolved") {
    setLoading(status === "acknowledged" ? "ack" : "resolve");
    const supabase = createClient();
    await supabase.from("alerts").update({ status }).eq("id", alertId);
    router.refresh();
    setLoading(null);
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <button
        onClick={() => update("acknowledged")}
        disabled={!!loading}
        className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
      >
        {loading === "ack" ? "…" : "Acknowledge"}
      </button>
      <button
        onClick={() => update("resolved")}
        disabled={!!loading}
        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        {loading === "resolve" ? "…" : "Resolve"}
      </button>
    </div>
  );
}
