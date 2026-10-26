/** @type {import('next').NextConfig} */
const internalBackendUrl =
  process.env.INTERNAL_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://backend:8000";

const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${internalBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

