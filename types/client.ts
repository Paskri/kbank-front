import type { Account } from './account'

export type Client = {
  id: number
  name: string
  firstName: string
  accounts: Account[]
}

export type Clients = Client[]
