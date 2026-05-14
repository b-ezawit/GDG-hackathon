import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
};
// next.config.js
module.exports = {
  allowedDevOrigins: ['192.168.56.1'],
}

export default nextConfig;
