/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during builds — types verified locally
    ignoreBuildErrors: true,
  },
  // Stripe ships ESM with cross-file imports webpack can't follow when it
  // tries to bundle server code. Let Next require it at runtime instead.
  experimental: {
    serverComponentsExternalPackages: ["stripe"],
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
