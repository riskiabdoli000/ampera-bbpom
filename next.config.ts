import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/keterbukaan%20informasi",
        destination: "/keterbukaan-informasi",
      },
      {
        source: "/keterbukaan informasi",
        destination: "/keterbukaan-informasi",
      },
    ];
  },
};

export default nextConfig;
