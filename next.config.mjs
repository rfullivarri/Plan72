/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ajusta estos valores si publicas en https://usuario.github.io/REPO
  output: "export",
  basePath: "/REPO",
  assetPrefix: "/REPO/",
};

export default nextConfig;
