import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.56.1"],
  /** Keep pdf stack native; bundling often breaks text extraction in API routes. */
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "canvas"],
};

export default nextConfig;
