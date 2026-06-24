'use client'

import useSWR from 'swr'
import TopMenu from '@/components/top-menu'
import type { Client } from '@/types/client'
import Image from 'next/image'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AppShell({ children }: { children: React.ReactNode }) {
  const {
    data: clients,
    error,
    isLoading,
  } = useSWR<Client[]>('https://kbank.api.krieg.fr/clients', fetcher)

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-zinc-50 font-sans ">
        <main className="flex flex-col w-full max-w-5xl items-start justify-start px-16 bg-white">
          <div className="flex flex-col h-70 justify-center">
            <div className="flex w-full justify-items-start items-end ">
              <Image
                className="object-cover mb-1.5"
                src="/logo192.png"
                alt="Next.js logo"
                width={100}
                height={100}
                priority
              />
              <p className="text-7xl">banK</p>
            </div>
            <p className="text-2xl">
              La banque comme vous ne l&apos;avez jamais vue
            </p>
          </div>
          {isLoading && <p>Loading...</p>}
          {error && <p>Error loading clients</p>}
          <TopMenu clients={clients ?? []} />
          {children}
        </main>
      </div>
    </>
  )
}
