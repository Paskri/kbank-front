'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActiveClient } from '@/context/ActiveClientContext'
import { formatNames } from '@/lib/functions'
import { AccountWithOwner } from '@/types/account'
import { Client } from '@/types/client'
import { useSWRConfig } from 'swr'

export default function ComptesClient() {
  const { activeClient } = useActiveClient()
  const accounts = activeClient?.accounts

  const { cache } = useSWRConfig()
  const NEXT_PUBLIC_API_HOST = process.env.NEXT_PUBLIC_API_HOST
  const clients = (
    cache.get(`${NEXT_PUBLIC_API_HOST}/clients`) as
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

  return (
    <div className="w-full">
      {accounts?.map((account) => (
        <Card key={account.accountId} className="w-full my-5">
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>
                  {account.accountType === 'CURRENT'
                    ? 'Compte Courant'
                    : account.accountType === 'SAVINGS'
                      ? 'Compte Livret'
                      : ''}
                </CardTitle>

                <p className="text-sm text-muted-foreground mt-1">
                  {account.iban}
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-muted-foreground">
                  Solde disponible
                </p>

                <p className="text-2xl font-bold">
                  {`${(parseInt(account.balance) / 100).toLocaleString(
                    'fr-FR',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  )} ${account.accountCur === 'EUR' ? '€' : '-?-'}`}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Derniers mouvements
            </h3>

            <div className="divide-y">
              {account.transactions.toReversed().map((transaction) => {
                let type = ''
                let amount = 0
                let to = ''
                switch (transaction.type.trim()) {
                  case 'WITHDRAW':
                    type = 'Retrait'
                    amount = parseInt(transaction.amount.toString()) / -100
                    break
                  case 'PAYMENT':
                    type = 'Paiement'
                    amount = parseInt(transaction.amount.toString()) / -100
                    break
                  case 'TRANSFER':
                    if (account.accountId === transaction.from) {
                      amount = parseInt(transaction.amount.toString()) / -100
                    } else if (account.accountId === transaction.to) {
                      amount = parseInt(transaction.amount.toString()) / 100
                    }
                    type = 'Virement'

                    /*** to ***/
                    const toWho = allAccounts.find(
                      (a) => a.accountId === transaction.to,
                    )
                    if (toWho?.ownerId === transaction.clientId) {
                      if (
                        toWho?.accountType === 'CURRENT' &&
                        transaction.from === account.accountId
                      ) {
                        to = 'vers votre compte courant'
                      } else if (
                        toWho?.accountType === 'CURRENT' &&
                        transaction.to === account.accountId
                      ) {
                        to = 'depuis votre compte livret'
                      } else if (
                        toWho?.accountType === 'SAVINGS' &&
                        transaction.from === account.accountId
                      ) {
                        to = 'vers votre compte livret'
                      } else if (
                        toWho?.accountType === 'SAVINGS' &&
                        transaction.to === account.accountId
                      ) {
                        to = 'depuis votre compte courant'
                      }
                    } else {
                      to = `pour le compte de ${formatNames(toWho?.ownerName ?? '')} ${formatNames(toWho?.ownerFirstName ?? '')}`
                    }

                    break
                  case 'DEPOSIT':
                    type = 'Dépot'
                    amount = parseInt(transaction.amount.toString()) / 100
                }

                return (
                  <div
                    key={`${transaction.id}`}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {type} - {to} - {transaction.reason}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {transaction.date} à {transaction.time}
                      </p>
                    </div>

                    <div
                      className={`font-semibold ${
                        amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {amount > 0 ? '+' : ''}
                      {amount.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      €
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
