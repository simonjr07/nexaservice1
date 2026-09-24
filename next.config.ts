import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const securityHeaders = [
      { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    if (process.env.VERCEL_ENV === "production") {
      securityHeaders.push({ key: "Strict-Transport-Security", value: "max-age=31536000" });
    }
    return [
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
