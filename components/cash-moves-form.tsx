'use client'

import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { mutate } from 'swr'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  account: z.string().min(1, 'Please select an account'),
  move: z.enum(['DEPOSIT', 'WITHDRAW']),
  amount: z.number().positive('Le montant doit être supérieur à 0'),
  reason: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

import { Account } from '@/types/account'
import { useState } from 'react'
import { useActiveClient } from '@/context/ActiveClientContext'
import { Client } from '@/types/client'

export default function CashOperationForm() {
  const { activeClient, setActiveClient } = useActiveClient()
  const accounts = activeClient?.accounts ?? []
  const [currentAcc, setCurrentAcc] = useState<Account | undefined>(undefined)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account: '',
      move: 'DEPOSIT',
      amount: undefined,
      reason: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    console.log(values)
    if (
      values.move === 'WITHDRAW' &&
      currentAcc &&
      values.amount * 100 > parseInt(currentAcc.balance)
    ) {
      toast.warning('Solde insuffisant : ', {
        description: `Vous disposez de ${parseInt(currentAcc.balance) / 100} ${currentAcc.accountCur} et ne pouvez pas retirer ${values.amount} ${currentAcc.accountCur}`,
      })
      return
    }

    const payload = {
      clientId: activeClient?.id,
      account: currentAcc?.accountId,
      move: values.move,
      amount: Math.round(values.amount * 100),
      reason: values.reason,
    }
    console.log('Données envoyées: ', payload)
    const NEXT_PUBLIC_API_HOST = process.env.NEXT_PUBLIC_API_HOST
    const res = await fetch(`${NEXT_PUBLIC_API_HOST}/cash-move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    reset({
      account: '',
      move: 'DEPOSIT',
      amount: undefined,
      reason: '',
    })

    if (!res.ok) {
      const errorData = await res.json()

      console.log(errorData)

      toast.error(errorData.message, {
        description: errorData.details,
      })

      return
    }

    /*** Success ***/
    const data = await res.json()
    console.log('données retournées: ', data)

    /*** Cobol errors handling ?? ***/

    /*** Updating Client datas and accounts ***/
    const updatedClients = await mutate(`${NEXT_PUBLIC_API_HOST}/clients`)
    const newActive = updatedClients.find(
      (c: Client) => c.id === activeClient?.id,
    )
    if (newActive) {
      setActiveClient(newActive)
    }

    toast.success('Retrait effectué : ', {
      description: `Vous venez de ${
        values.move === 'DEPOSIT' ? 'déposer' : 'retirer'
      } ${values.amount} ${currentAcc?.accountCur} sur votre ${
        currentAcc?.accountType === 'CURRENT'
          ? 'Compte courant'
          : 'Compte livret'
      }. Le nouveau solde de votre compte est de ${parseInt(data.newBalance) / 100}`,
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Dépot</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Account */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Compte</label>

            <Controller
              control={control}
              name="account"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    const account: Account | undefined = accounts?.find(
                      (account) => account.accountType === value,
                    )

                    setCurrentAcc(account)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le compte" />
                  </SelectTrigger>

                  <SelectContent>
                    {accounts?.map((account: Account) => (
                      <SelectItem
                        value={account.accountType}
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

            {errors.account && (
              <p className="text-sm text-red-500">{errors.account.message}</p>
            )}
          </div>

          {/* Operation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type d&apos;opération</label>

            <Controller
              control={control}
              name="move"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="DEPOSIT">Dépot</SelectItem>

                    <SelectItem value="WITHDRAW">Retrait</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant</label>

            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00 €"
              {...register('amount', {
                valueAsNumber: true,
              })}
            />

            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description (optionel)
            </label>

            <Input placeholder="..." {...register('reason')} />
          </div>

          <Button type="submit" className="w-full" variant="kbank">
            Executer
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
