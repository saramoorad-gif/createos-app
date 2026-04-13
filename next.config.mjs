/** @type {import('next').NextConfig} */
const nextConfig = {
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
