'use client'

import React from 'react'
import { AccountWithOwner } from '@/types/account'
import { Client } from '@/types/client'
import { useSWRConfig } from 'swr'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function AllAccounts() {
  const { cache } = useSWRConfig()
  const clients = (
    cache.get('https://kbank.api.krieg.fr/clients') as
      | { data: Client[] }
      | undefined
  )?.data

  const allAccounts: AccountWithOwner[] =
    clients?.flatMap((client) =>
      client.accounts.map((account) => ({
        ...account,
        ownerName: client.name,
        ownerFirstName: client.firstName,
      })),
    ) ?? []
  console.log(allAccounts)
  return (
    <>
      <h1>Comptes</h1>
      <div className="rounded-lg border bg-card shadow-sm w-full my-5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-200 hover:bg-blue-200 ">
              <TableHead>Compte</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>IBAN</TableHead>
              <TableHead className="text-center">Transactions</TableHead>
              <TableHead className="text-right">Solde</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {allAccounts.map((account) => (
              <TableRow key={account.accountId}>
                <TableCell className="font-medium">
                  {account.accountId}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      account.accountType === 'CURRENT'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {account.accountType}
                  </Badge>
                </TableCell>

                <TableCell>{account.ownerId}</TableCell>

                <TableCell className="font-mono text-xs">
                  {account.iban}
                </TableCell>

                <TableCell className="text-center">
                  {account.transactions.length}
                </TableCell>

                <TableCell className="text-right font-semibold">
                  {(parseInt(account.balance) / 100).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: account.accountCur,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
