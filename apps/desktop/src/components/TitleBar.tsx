import { ShieldCheck, Minus, Square, X } from "lucide-react";

// Only available inside Tauri runtime
const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function getTauriWindow() {
  if (!isTauri) return null;
  const { getCurrentWindow } = await import("@tauri-apps/api/window");
  return getCurrentWindow();
}

export function TitleBar() {
  async function minimize() { (await getTauriWindow())?.minimize(); }
  async function toggleMaximize() { (await getTauriWindow())?.toggleMaximize(); }
  async function close() { (await getTauriWindow())?.close(); }

  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-white border-b border-slate-200 flex items-center px-4 shrink-0"
    >
      {/* Brand */}
      <div className="flex items-center gap-2 pointer-events-none">
        <ShieldCheck className="w-4 h-4 text-brand-600" />
        <span className="text-sm font-bold text-slate-800">Vaulta</span>
        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded ml-1">
          Caregiver
        </span>
      </div>

      {/* Window controls */}
      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={minimize}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleMaximize}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={close}
          className="p-1.5 rounded hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
