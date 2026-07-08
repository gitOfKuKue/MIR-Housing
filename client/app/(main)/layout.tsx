import Footer from '@/src/components/layout/Footer'
import Header from '@/src/components/layout/Header'
import React from 'react'

const MainLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">{children}</div>
      {/* <Footer /> */}
    </div>
  )
}

export default MainLayout