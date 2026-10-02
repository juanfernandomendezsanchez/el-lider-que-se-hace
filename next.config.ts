import type { NextConfig } from "next";

// En GitHub Pages el sitio vive en una subruta; el flujo de despliegue define BASE_PATH.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
