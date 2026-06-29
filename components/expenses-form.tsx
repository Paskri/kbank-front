'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { useActiveClient } from '@/context/ActiveClientContext'

import { Client } from '@/types/client'
import { mutate } from 'swr'
import { toast } from 'sonner'

const formSchema = z.object({
  label: z.string().min(2, 'Label required'),
  amount: z.number().positive('Le montant doit être supérieur à 0'),
})

type FormValues = z.infer<typeof formSchema>

export default function ExpenseForm() {
  const { activeClient, setActiveClient } = useActiveClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      amount: undefined,
    },
  })

  const onSubmit = async (values: FormValues) => {
    console.log(values)

    const currentAcc = activeClient?.accounts.find(
      (c) => c.accountType === 'CURRENT',
    )

    const payload = {
      clientId: activeClient?.id,
      account: currentAcc?.accountId,
      move: 'PAYMENT',
      amount: Math.round(values.amount * 100),
      reason: values.label,
    }
    console.log('Données envoyées: ', payload)
    const NEXT_PUBLIC_API_HOST = process.env.NEXT_PUBLIC_API_HOST
    const res = await fetch(`${NEXT_PUBLIC_API_HOST}/expense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    console.log('Données retournées: ', data)

    if (!res.ok) {
      const errorData = await res.json()

      console.log(errorData)

      toast.error(errorData.message, {
        description: errorData.details,
      })

      return res.json()
    }
    reset({
      label: '',
      amount: undefined,
    })

    /*** Sucess ***/
    toast.success('Achat effectué : ', {
      description: `Vous venez de dépenser ${values.amount} ${currentAcc?.accountCur} pour
      ${values.label}.
      Le nouveau solde de votre compte est de ${parseInt(data.newBalance) / 100}`,
    })

    /*** Updating Client datas and accounts ***/
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
        <CardTitle>Nouvelle dépense</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Label */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Intitulé</label>

            <Input
              placeholder="Amazon, alimentation, carburant..."
              {...register('label')}
            />

            {errors.label && (
              <p className="text-sm text-red-500">{errors.label.message}</p>
            )}
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant (€)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="00.00 €"
              {...register('amount', {
                valueAsNumber: true,
              })}
            />

            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <Button variant="kbank" type="submit" className="w-full">
            Ajouter
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
