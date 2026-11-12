import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin/past-papers",
        destination: "/admin/dashboard?tab=past-papers",
        permanent: false,
      },
      {
        source: "/admin/exam-results",
        destination: "/admin/dashboard?tab=exam-results",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
