import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
