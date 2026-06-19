/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable Next.js image optimisation (WebP/AVIF, responsive sizing).
    // Allow images served from Vercel Blob and the local dev server.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
    // Prefer AVIF for best compression; fallback to WebP.
    formats: ["image/avif", "image/webp"],
  },
}

export default nextConfig
