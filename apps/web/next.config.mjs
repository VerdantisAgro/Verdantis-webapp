/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint is not configured yet; type errors still fail the build.
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
