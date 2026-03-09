export type SpendCategoryId =
  | 'housing'
  | 'groceries'
  | 'eating_out'
  | 'transport'
  | 'family'
  | 'health'
  | 'personal_care'
  | 'subscriptions'
  | 'utilities'
  | 'shopping'
  | 'travel'
  | 'education'
  | 'insurance'
  | 'gifts_giving'
  | 'income'
  | 'investment_transfer'
  | 'transfer'
  | 'other'

export type SpendOwnership = 'personal' | 'joint' | 'split'

export interface SpendCategory {
  id: SpendCategoryId
  name: string
  icon: string                    // emoji icon
  amount: number                  // total spend this month
  currency: string                // display currency
  budgetAmount: number | null     // null if no budget set
  totalMonthSpend: number         // household total — for proportion bar
  anomalyScore: number            // thisMonth / 3monthAvg
                                  // 1.0 if no history (first month)
  hasHistory: boolean             // false if <2 months of data
  vsAverage: number | null        // percentage above/below average
                                  // null if no history
  topMerchants: string[]          // top 2 merchant names by amount
                                  // empty array if not detectable
  isMortgage: boolean             // true for housing mortgage line
  isExcluded: boolean             // investment_transfer, transfer, income
  isRecurring: boolean            // detected as recurring charge
  insightLine: string | null      // templated insight text, null if none
  subcategory?: string            // for drill-down only
  geography?: 'india' | 'europe' | 'other'
  ownership: SpendOwnership       // personal / joint / split
}

export interface SpendDataSource {
  id: string
  householdId: string
  profileId: string               // primary owner
  institution: string             // 'abn_amro' | 'hdfc' | 'revolut' etc
  accountType: 'personal' | 'joint' | 'managed'
  accountLabel: string            // user-confirmed label e.g.
                                  // "ABN Amro - Anand ····4821"
  lastFourDigits?: string
  currency: string
  lastImported?: Date
  transactionCount: number
}

export interface SpendTransaction {
  id: string
  dataSourceId: string
  profileId: string
  householdId: string
  date: Date
  amount: number
  currency: string
  merchant: string
  description: string
  category: SpendCategoryId
  subcategory?: string
  geography: 'india' | 'europe' | 'other'
  ownership: SpendOwnership
  splitWithProfileId?: string
  splitRatio?: number             // Anand's share 0–1, default 0.5
  isRecurring: boolean
  recurringGroupId?: string
  rawDescription: string
  isExcluded: boolean
  dataSource: 'CSV' | 'MANUAL'
}

export interface SpendBudget {
  id: string
  householdId: string
  profileId: string | 'household'  // 'household' = shared budget
  category: SpendCategoryId
  monthlyAmount: number
  currency: string
}
