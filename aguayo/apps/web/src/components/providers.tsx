// apps/web/src/components/providers.tsx
'use client'

import { ReactNode } from 'react'
import SessionProvider from '@/providers/session-provider'
import { BottomNav } from '@repo/ui'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <BottomNav />
    </SessionProvider>
  )
}
