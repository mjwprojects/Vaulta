import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vaulta/supabase", "@vaulta/types"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
