'use client'

import { createContext, useContext, useState } from 'react'
import type { Client } from '@/types/client'

type ActiveClientContextType = {
  activeClient: Client | null
  setActiveClient: (client: Client) => void
}

const ActiveClientContext = createContext<ActiveClientContextType | undefined>(
  undefined,
)

export function ActiveClientProvider({
  children,
  initialClients,
}: {
  children: React.ReactNode
  initialClients: Client[]
}) {
  const [activeClient, setActiveClient] = useState<Client>(initialClients[0])

  return (
    <ActiveClientContext.Provider value={{ activeClient, setActiveClient }}>
      {children}
    </ActiveClientContext.Provider>
  )
}

export function useActiveClient() {
  const context = useContext(ActiveClientContext)
  if (!context) {
    throw new Error(
      'useActiveAccount must be used within ActiveAccountProvider',
    )
  }
  return context
}
