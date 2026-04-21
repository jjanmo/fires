import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 3600,  // 뮤테이션(관심종목·매매일지) 시 router.refresh()로 수동 무효화
      static: 3600,
    },
  },
};

export default nextConfig;
