'use client'

import React from 'react'
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

export default function AllUsers() {
  const NEXT_PUBLIC_API_HOST = process.env.NEXT_PUBLIC_API_HOST
  const { cache } = useSWRConfig()
  const clients = (
    cache.get(`${NEXT_PUBLIC_API_HOST}/clients`) as
      | { data: Client[] }
      | undefined
  )?.data

  console.log(clients)
  return (
    <>
      <h1>AllUsers</h1>
      <div className="rounded-lg border bg-card shadow-sm w-full my-5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-blue-200 hover:bg-blue-200">
              <TableHead>ID</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead className="text-center">Nombre de comptes</TableHead>
              <TableHead className="text-center">Statut</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.id}</TableCell>

                <TableCell>{client.name}</TableCell>

                <TableCell>{client.firstName}</TableCell>

                <TableCell className="">
                  <div className="w-full flex justify-center">
                    {client.accounts.length}
                  </div>
                </TableCell>

                <TableCell className=" flex justify-center">
                  <Badge variant="secondary">Actif</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
