"use client";
import { useActionState, useEffect } from "react";
import { acceptInviteAction, type AcceptState } from "./actions";
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, User } from "lucide-react";
import Link from "next/link";

interface Props {
  token: string;
  inviteId: string;
  firstName: string;
  lastName: string;
  condition: string | null;
  isSignedIn: boolean;
  userEmail: string | null;
}

const INIT: AcceptState = { status: "idle" };

export function AcceptInviteClient({
  token, inviteId, firstName, lastName, condition, isSignedIn, userEmail,
}: Props) {
  const [state, action, pending] = useActionState(acceptInviteAction, INIT);

  // Success → redirect to patient dashboard
  useEffect(() => {
    if (state.status === "success") {
      setTimeout(() => { window.location.href = "/dashboard"; }, 1500);
    }
  }, [state.status]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="max-w-md w-full rounded-2xl border p-8 space-y-6"
        style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Vaulta mark */}
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6" style={{ color: "var(--brand)" }} />
          <span className="font-bold tracking-wide text-sm" style={{ color: "var(--text)" }}>
            VAULTA <span className="font-normal" style={{ color: "var(--text-muted)" }}>Family Health</span>
          </span>
        </div>

        {/* Patient info */}
        <div
          className="rounded-xl p-4 flex items-center gap-4"
          style={{ backgroundColor: "rgba(142,77,255,0.1)", border: "1px solid rgba(142,77,255,0.25)" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
            style={{ backgroundColor: "rgba(142,77,255,0.2)", color: "var(--brand)" }}
          >
            {firstName[0]}{lastName[0]}
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: "var(--text)" }}>
              {firstName} {lastName}
            </p>
            {condition && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{condition}</p>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
            You've been invited to Vaulta
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Your caregiver has set up a health monitoring profile for you on Vaulta.
            Accept this invite to access your personalised dashboard — medication schedules,
            daily check-ins, and health records, all in one place.
          </p>
        </div>

        {/* Error */}
        {state.status === "error" && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl text-sm"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {state.message}
          </div>
        )}

        {/* Success */}
        {state.status === "success" && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl text-sm"
            style={{ backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Invite accepted!</p>
              <p className="text-xs mt-0.5 opacity-80">Redirecting to your dashboard…</p>
            </div>
          </div>
        )}

        {state.status !== "success" && (
          isSignedIn ? (
            /* Already signed in — accept directly */
            <form action={action} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="invite_id" value={inviteId} />

              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: "var(--surface-raised)", border: "1px solid var(--border)" }}
              >
                <User className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Signed in as</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{userEmail}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: "var(--brand)" }}
              >
                {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                {pending ? "Accepting invite…" : "Accept invite & open dashboard"}
              </button>
            </form>
          ) : (
            /* Not signed in — prompt to sign up or log in */
            <div className="space-y-3">
              <Link
                href={`/auth/login?next=/invite/${token}`}
                className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: "var(--brand)" }}
              >
                Sign in to accept invite
              </Link>
              <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Don't have an account?{" "}
                <Link
                  href={`/auth/login?next=/invite/${token}&signup=true`}
                  className="underline"
                  style={{ color: "var(--brand)" }}
                >
                  Create one for free
                </Link>
              </p>
            </div>
          )
        )}

        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          Vaulta is a secure family health platform. Your medical information is encrypted and
          accessible only to you and your authorised caregiver.
        </p>
      </div>
    </div>
  );
}
