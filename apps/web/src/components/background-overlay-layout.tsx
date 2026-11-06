"use client"

interface BackgroundOverlayLayoutProps {
  children: React.ReactNode
  imageSrc?: string
}

export function BackgroundOverlayLayout({
  children,
  imageSrc = "/farmland-background.jpg",
}: BackgroundOverlayLayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Full-bleed background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${imageSrc}')` }}
      />
      {/* Dark gradient overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />
      {/* Content layer */}
      <div className="relative z-10 w-full max-w-5xl">{children}</div>
    </div>
  )
}
