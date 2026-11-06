/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle used by the Docker image.
  output: "standalone",
  eslint: {
    // ESLint is not configured yet; type errors still fail the build.
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
