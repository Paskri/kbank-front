export type Account = {
  accountId: string
  accountType: string
  ownerId: string
  iban: string
  balance: string
  accountCur: string
  transactions: Transaction[]
}
export type AccountWithOwner = Account & {
  ownerName: string
  ownerFirstName: string
}

export type Transaction = {
  id: string
  accountId: string
  clientId: string
  from: string
  to: string
  date: string
  time: string
  type: string
  amount: number
  status: string
  reason: string
}
