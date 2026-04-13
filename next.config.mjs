/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint during builds — we'll fix warnings separately
    ignoreDuringBuilds: true,
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
