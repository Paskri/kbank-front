'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useActiveClient } from '@/context/ActiveClientContext'
import { mutate, useSWRConfig } from 'swr'
import { formatNames } from '@/lib/functions'

import { Account, AccountWithOwner } from '@/types/account'
import { Client } from '@/types/client'
import { toast } from 'sonner'

const formSchema = z.object({
  from: z.string().min(1, 'Required'),
  to: z.string().min(1, 'Required'),
  amount: z.number().positive('Le montant doit être supérieur à 0'),
  message: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function TransferForm() {
  const { activeClient, setActiveClient } = useActiveClient()
  const accounts = activeClient?.accounts ?? []
  const [currentAcc, setCurrentAcc] = useState<Account | undefined>(undefined)
  const [targetAcc, setTargetAcc] = useState<Account | undefined>(undefined)

  const { cache } = useSWRConfig()
  const NEXT_PUBLIC_API_HOST = process.env.NEXT_PUBLIC_API_HOST

  const clients = (
    cache.get(`${NEXT_PUBLIC_API_HOST}/clients`) as
      | { data: Client[] }
      | undefined
  )?.data

  const rawAccounts: AccountWithOwner[] =
    clients
      ?.flatMap((client) =>
        client.accounts.map((account) => ({
          ...account,
          ownerName: client.name,
          ownerFirstName: client.firstName,
        })),
      )
      .filter(
        (account) =>
          account.accountType === 'CURRENT' ||
          account.ownerId === currentAcc?.ownerId,
      ) ?? []
  const allAccounts = [...rawAccounts].sort((a, b) => {
    if (a.ownerId === activeClient?.id.toString()) return -1
    if (b.ownerId === activeClient?.id.toString()) return 1
    return 0
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: '',
      to: '',
      amount: undefined,
      message: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    const payload = {
      clientId: currentAcc?.ownerId,
      from: currentAcc?.accountId,
      to: targetAcc?.accountId,
      amount: Math.round(values.amount * 100),
      message: values.message,
    }

    console.log('Données envoyées: ', payload)
    const res = await fetch(`${NEXT_PUBLIC_API_HOST}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorData = await res.json()

      console.log(errorData)

      toast.error(errorData.message, {
        description: errorData.details,
      })
      return
    }

    let to = ''
    if (targetAcc?.ownerId === currentAcc?.ownerId) {
      if (targetAcc?.accountType === 'CURRENT') {
        to = 'vers votre compte livret'
      } else if (targetAcc?.accountType === 'SAVINGS') {
        to = 'vers votre compte courant'
      }
    } else {
      const owner = allAccounts.find((a) => a.ownerId === targetAcc?.ownerId)
      to = `pour le compte de ${owner?.ownerName} ${owner?.ownerFirstName}`
    }

    const data = await res.json()
    console.log('Données reçues: ', data)
    toast.success('Virement effectué : ', {
      description: `Vous venez de virer ${values.amount} ${currentAcc?.accountCur} 
      ${to}.
      Le nouveau solde de votre compte est de ${parseInt(data.newBalance) / 100} $${currentAcc?.accountCur}`,
    })

    const updatedClients = await mutate(`${NEXT_PUBLIC_API_HOST}/clients`)
    const newActive = updatedClients.find(
      (c: Client) => c.id === activeClient?.id,
    )
    if (newActive) {
      setActiveClient(newActive)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto my-5">
      <CardHeader>
        <CardTitle>Effectuer un virement</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/*** From account ***/}
          <div className="space-y-2">
            <label className="text-sm font-medium">Depuis le compte</label>

            <Controller
              control={control}
              name="from"
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    const account: Account | undefined = accounts?.find(
                      (account) => account.accountId.toString() === value,
                    )

                    setCurrentAcc(account)

                    /*** Resetting second select to avoid crapy display ***/
                    setTargetAcc(undefined)

                    setValue('to', '')
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le compte à débiter" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((account: Account) => (
                      <SelectItem
                        value={account.accountId.toString()}
                        key={account.iban}
                      >
                        {account.accountType === 'CURRENT'
                          ? 'Compte courant -'
                          : account.accountType === 'SAVINGS'
                            ? 'Compte Livret - '
                            : ''}{' '}
                        --{' '}
                        {(parseInt(account.balance) / 100).toLocaleString(
                          'fr-FR',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}{' '}
                        {account.accountCur === 'EUR' ? '€' : '-?'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {errors.from && (
              <p className="text-sm text-red-500">{errors.from.message}</p>
            )}
          </div>

          {/*** To ***/}
          <div className="space-y-2">
            <label className="text-sm font-medium">Vers le compte</label>
            <Controller
              control={control}
              name="to"
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    console.log()
                    const account: Account | undefined = allAccounts?.find(
                      (account) => {
                        console.log(
                          'Données de recherche de compte: ',
                          account.accountId.toString(),
                          value,
                          account.accountId.toString() === value,
                        )

                        return account.accountId.toString() === value
                      },
                    )

                    setTargetAcc(account)
                  }}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le compte à créditer" />
                  </SelectTrigger>
                  <SelectContent>
                    {allAccounts?.map((account: AccountWithOwner) => {
                      if (
                        currentAcc?.accountId != account.accountId &&
                        account.ownerId != currentAcc?.ownerId &&
                        account.accountType === currentAcc?.accountType
                      ) {
                        return (
                          <SelectItem
                            value={account.accountId.toString()}
                            key={account.iban}
                          >
                            Compte de {formatNames(account.ownerName)}{' '}
                            {formatNames(account.ownerFirstName)}
                          </SelectItem>
                        )
                      } else if (
                        account.ownerId === currentAcc?.ownerId &&
                        account.accountType != currentAcc?.accountType
                      ) {
                        return (
                          <SelectItem
                            value={account.accountId.toString()}
                            key={account.iban}
                          >
                            {account.accountType === 'CURRENT'
                              ? 'Compte courant -'
                              : account.accountType === 'SAVINGS'
                                ? 'Compte Livret - '
                                : ''}{' '}
                            --{' '}
                            {(parseInt(account.balance) / 100).toLocaleString(
                              'fr-FR',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}{' '}
                            {account.accountCur === 'EUR' ? '€' : '-?'}
                          </SelectItem>
                        )
                      }
                    })}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/*** Amount ***/}
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant (€)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00 €"
              {...register('amount', {
                valueAsNumber: true,
              })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/*** Message ***/}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message (optional)</label>
            <Input placeholder="Reason..." {...register('message')} />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800"
          >
            Executer
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
