export interface Shop {
  id: string
  name: string
  created_at: string
}

export interface Budget {
  id: string
  category: 'food' | 'other'
  amount: number
  week_start: string
  created_at: string
}

export interface Expense {
  id: string
  shop_id: string | null
  amount: number
  category: 'food' | 'other'
  person: string
  note: string | null
  created_at: string
}

export interface ExpenseWithShop extends Expense {
  shops: { name: string } | null
}

export interface SavingsGoal {
  id: string
  name: string
  target_amount: number
  color: string
  created_at: string
}

export interface SavingsTransaction {
  id: string
  goal_id: string
  amount: number
  note: string | null
  date: string
  created_at: string
}

export interface SavingsGoalWithTotal extends SavingsGoal {
  total_saved: number
}