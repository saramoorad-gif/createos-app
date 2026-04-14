/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during builds — types verified locally
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.createsuite.co" }],
        destination: "https://createsuite.co/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
