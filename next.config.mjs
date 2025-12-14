/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Tắt strict mode để kéo thả mượt hơn
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Cho phép load ảnh từ mọi nguồn (Supabase, v.v.)
      },
    ],
  },
};

export default nextConfig;