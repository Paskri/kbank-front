'use client'

import Link from 'next/link'
//import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Client, Clients } from '@/types/client'
import { useEffect } from 'react'
import { useActiveClient } from '@/context/ActiveClientContext'
import { formatNames } from '@/lib/functions'
import { toast } from 'sonner'
import { usePathname } from 'next/navigation'

type Props = {
  clients: Clients
}

export default function TopMenu({ clients }: Props) {
  const { activeClient, setActiveClient } = useActiveClient()
  const pathName = usePathname()

  const getMenuItemClass = (href: string) =>
    `flex h-12 items-center px-3 text-lg transition ${
      pathName === href
        ? 'bg-blue-100 text-blue-900'
        : 'hover:bg-blue-100 hover:text-blue-900'
    }`

  useEffect(() => {
    if (!activeClient && clients.length > 0) {
      setActiveClient(clients[0])
    }
  }, [activeClient, clients, setActiveClient])

  const handleSwitchAccount = (client: Client) => {
    setActiveClient(client)

    toast.success('Nouveau compte actif : ', {
      description: `${formatNames(client.name)} ${formatNames(client.firstName)}`,
    })
  }

  return (
    <div className="w-full border-b rounded-md bg-blue-900 text-white">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-2">
            <NavigationMenuItem>
              <Link href="/" className={getMenuItemClass('/')}>
                Accueil
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/comptes" className={getMenuItemClass('/comptes')}>
                Comptes
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link
                href="/depot-retrait"
                className={getMenuItemClass('/depot-retrait')}
              >
                Dépot & retrait
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/virement" className={getMenuItemClass('/virement')}>
                Virement
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/achat" className={getMenuItemClass('/achat')}>
                Dépense
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={getMenuItemClass('/admin')}>Admin</button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-fit">
                  <DropdownMenuItem asChild>
                    <Link href="/admin/utilisateurs">
                      Tous les utilisateurs
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/admin/comptes">Tous les comptes</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/admin/transactions">
                      Toutes les transactions
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{`${activeClient?.name[0]}${activeClient?.firstName[0]}`}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {clients?.map((client) => (
              <DropdownMenuItem
                key={'clientID' + client.id}
                onClick={() => handleSwitchAccount(client)}
                className={client.id === activeClient?.id ? 'bg-blue-200' : ''}
              >
                {`${formatNames(client.name)} ${formatNames(client.firstName)}`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
