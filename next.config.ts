import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the libSQL/Turso client (and its native bindings) out of the bundler.
  serverExternalPackages: ["@libsql/client", "libsql"],
};

export default nextConfig;
