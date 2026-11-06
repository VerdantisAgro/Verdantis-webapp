interface PageContainerProps {
  children: React.ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="p-6 lg:p-8">{children}</div>
    </div>
  )
}
