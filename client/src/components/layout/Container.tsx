import React from 'react'

const Container = ({className, children}: {className?: string, children: React.ReactNode}) => {
  return (
    <div className={`mx-auto max-w-9xl px-4 sm:px-6 lg:px-8 ${className ?? ''}`}>{children}</div>
  )
}

export default Container