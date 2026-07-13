import Header from '@/src/components/layout/Header'
import React from 'react'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header />
      {/* Fixed header is out of flow; spacer keeps content below it. */}
      <div className="h-16 shrink-0" aria-hidden="true" />
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  )
}

export default MainLayout
