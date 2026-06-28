import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8" />
          <span className="text-2xl font-bold tracking-tight">Vaulta</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Secure care,<br />always connected.
          </h1>
          <p className="text-brand-100 text-lg leading-relaxed">
            Monitor your patients in real time, receive instant alerts, and access
            emergency summaries — all protected by consent-based access and full
            audit logging.
          </p>
        </div>
        <p className="text-brand-200 text-sm">
          © {new Date().getFullYear()} Vaulta Health. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <ShieldCheck className="w-6 h-6 text-brand-600" />
            <span className="text-xl font-bold text-brand-700">Vaulta</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 mb-8 text-sm">Sign in to your caregiver account</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
