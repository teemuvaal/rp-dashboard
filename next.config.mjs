/** @type {import('next').NextConfig} */
// add here support for external images, currently this supabase project
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qxvovctfjcxifcngajlq.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
