'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Transaction } from '@/types/account'
import React from 'react'
import useSWR from 'swr'
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AllTransactions() {
  const {
    data: allTransactions,
    error,
    isLoading,
  } = useSWR<Transaction[]>('https://kbank.api.krieg.fr/alltrans', fetcher, {
    fallbackData: [],
  })

  const PAGE_SIZE = 25

  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    return allTransactions?.toReversed()
  }, [allTransactions])

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sorted?.slice(start, start + PAGE_SIZE)
  }, [sorted, page])

  const totalPages = Math.ceil((allTransactions?.length ?? 0) / PAGE_SIZE)

  const formatAmount = (value: string) => {
    const num = Number(value) / 100
    return num.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })
  }

  const statusVariant = (status: string) => {
    switch (status.trim()) {
      case 'SUCCESS':
        return 'default'
      case 'PENDING':
        return 'secondary'
      case 'FAILED':
        return 'destructive'
      default:
        return 'outline'
    }
  }
  return (
    <>
      <h1>Transactions</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading transactions</p>}

      <div className="space-y-4 my-5 w-full">
        <div className=" border bg-card shadow-sm rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-200 hover:bg-blue-200 ">
                <TableHead>ID</TableHead>
                <TableHead>Compte</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>De → Vers</TableHead>
                <TableHead>Raison</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated?.map((tx, i) => (
                <TableRow key={`${tx.id}-${i}`}>
                  <TableCell className="font-mono text-xs">{tx.id}</TableCell>

                  <TableCell>{tx.accountId}</TableCell>

                  <TableCell>
                    <Badge variant="outline">{tx.type.trim()}</Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {tx.from} → {tx.to}
                  </TableCell>

                  <TableCell className="max-w-50 truncate">
                    {tx.reason}
                  </TableCell>

                  <TableCell>
                    <Badge variant={statusVariant(tx.status)}>
                      {tx.status.trim()}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    {formatAmount(tx.amount.toString())}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Précédent
            </Button>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
