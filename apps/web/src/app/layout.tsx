import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Vaulta — Family Health", template: "%s | Vaulta" },
  description:
    "Vaulta is a secure family health vault — organise medical records, care plans, allergies, emergency contacts, and medication tracking in one private place.",
  applicationName: "Vaulta",
  keywords: [
    "family health",
    "medical records",
    "care plans",
    "emergency contacts",
    "health vault",
    "medication tracking",
    "health records app",
  ],
  openGraph: {
    type: "website",
    siteName: "Vaulta",
    title: "Vaulta — Family Health, Safely Organised",
    description:
      "Secure records. Clear care. Always accessible when it matters most. Manage your family's health information with Vaulta.",
    images: [{ url: "/og-image.png", width: 1024, height: 1024, alt: "Vaulta — Family Health" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaulta — Family Health, Safely Organised",
    description:
      "Secure records. Clear care. Always accessible when it matters most.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
