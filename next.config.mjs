import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ajusta estos valores si publicas en https://usuario.github.io/Plan72
  output: "export",
  basePath: "/Plan72",
  assetPrefix: "/Plan72/",
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    const shouldStubMapLibre = isServer || process.env.MAPLIBRE_STUB === "1";
    if (shouldStubMapLibre) {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "maplibre-gl$": path.resolve(__dirname, "lib/maplibre-gl/dist/index.js"),
        "maplibre-gl/dist/maplibre-gl.css": path.resolve(__dirname, "lib/maplibre-gl/dist/maplibre-gl.css"),
      };
    }
    return config;
  },
};

export default nextConfig;
