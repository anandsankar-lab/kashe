export type AppDataState =
  | 'UNAUTHENTICATED'       // State 1: not logged in
  | 'AUTHENTICATED_EMPTY'   // State 2: logged in, no data
  | 'HAS_DATA'              // State 3: has some data

export interface DataSource {
  id: string
  institution: string
  accountLabel: string
  lastUpdatedDays: number | null
  status: 'FRESH' | 'STALE' | 'NEVER_CONNECTED'
  type: 'SPEND' | 'PORTFOLIO' | 'SALARY'
}

// ── CATEGORY TAXONOMY ────────────────────────────────────────────────────────

export type SpendCategory =
  | 'housing'
  | 'groceries'
  | 'eating_out'
  | 'transport'
  | 'health'
  | 'personal_care'
  | 'subscriptions'
  | 'utilities'
  | 'shopping'
  | 'travel'
  | 'education'
  | 'insurance'
  | 'childcare'
  | 'gifts_giving'
  | 'other'
  | 'income'
  | 'investment_transfer'
  | 'transfer'

export const EXCLUDED_FROM_SPEND_TOTAL: SpendCategory[] = [
  'income',
  'investment_transfer',
  'transfer',
]

// Nudge thresholds for 'other' category
export const OTHER_NUDGE_MERCHANT_COUNT = 3   // same merchant X+ times
export const OTHER_NUDGE_TRANSACTION_COUNT = 5 // X+ transactions total
export const OTHER_NUDGE_AMOUNT = 50           // base currency equivalent

// ── SUBCATEGORIES ─────────────────────────────────────────────────────────────

export interface SubCategory {
  id: string
  label: string
  parentCategory: SpendCategory
}

export const SUBCATEGORIES: Record<SpendCategory, SubCategory[]> = {
  housing: [
    { id: 'rent_mortgage',        label: 'Rent / Mortgage',             parentCategory: 'housing' },
    { id: 'home_insurance',       label: 'Home insurance',              parentCategory: 'housing' },
    { id: 'maintenance_repairs',  label: 'Maintenance & repairs',       parentCategory: 'housing' },
    { id: 'service_charges',      label: 'Service charges / HOA',       parentCategory: 'housing' },
    { id: 'cleaning_help',        label: 'Cleaning & household help',   parentCategory: 'housing' },
    { id: 'furniture_furnishings',label: 'Furniture & furnishings',     parentCategory: 'housing' },
  ],
  groceries: [
    { id: 'supermarket',          label: 'Supermarket',                 parentCategory: 'groceries' },
    { id: 'fresh_market',         label: 'Fresh market',                parentCategory: 'groceries' },
    { id: 'online_grocery',       label: 'Online grocery delivery',     parentCategory: 'groceries' },
    { id: 'convenience_store',    label: 'Convenience store',           parentCategory: 'groceries' },
    { id: 'specialty_food',       label: 'Specialty food store',        parentCategory: 'groceries' },
  ],
  eating_out: [
    { id: 'restaurants',          label: 'Restaurants',                 parentCategory: 'eating_out' },
    { id: 'food_delivery',        label: 'Food delivery',               parentCategory: 'eating_out' },
    { id: 'cafes_coffee',         label: 'Cafés & coffee',              parentCategory: 'eating_out' },
    { id: 'work_lunch',           label: 'Work lunch',                  parentCategory: 'eating_out' },
    { id: 'bars_nightlife',       label: 'Bars & nightlife',            parentCategory: 'eating_out' },
    { id: 'fast_food',            label: 'Fast food',                   parentCategory: 'eating_out' },
  ],
  transport: [
    { id: 'public_transit',       label: 'Public transit',              parentCategory: 'transport' },
    { id: 'taxi_rideshare',       label: 'Taxi & rideshare',            parentCategory: 'transport' },
    { id: 'fuel',                 label: 'Fuel',                        parentCategory: 'transport' },
    { id: 'parking',              label: 'Parking',                     parentCategory: 'transport' },
    { id: 'short_haul_flights',   label: 'Short-haul flights',          parentCategory: 'transport' },
    { id: 'bike_scooter',         label: 'Bike & scooter',              parentCategory: 'transport' },
    { id: 'tolls_road',           label: 'Tolls & road charges',        parentCategory: 'transport' },
    { id: 'car_maintenance',      label: 'Car maintenance',             parentCategory: 'transport' },
  ],
  health: [
    { id: 'doctor_gp',            label: 'Doctor & GP',                 parentCategory: 'health' },
    { id: 'dentist',              label: 'Dentist',                     parentCategory: 'health' },
    { id: 'pharmacy',             label: 'Pharmacy',                    parentCategory: 'health' },
    { id: 'hospital_specialist',  label: 'Hospital & specialist',       parentCategory: 'health' },
    { id: 'mental_health',        label: 'Mental health & therapy',     parentCategory: 'health' },
    { id: 'optical',              label: 'Optical',                     parentCategory: 'health' },
    { id: 'medical_devices',      label: 'Medical devices',             parentCategory: 'health' },
  ],
  personal_care: [
    { id: 'gym_fitness',          label: 'Gym & fitness',               parentCategory: 'personal_care' },
    { id: 'haircut_salon',        label: 'Haircut & salon',             parentCategory: 'personal_care' },
    { id: 'grooming_cosmetics',   label: 'Grooming & cosmetics',        parentCategory: 'personal_care' },
    { id: 'spa_wellness',         label: 'Spa & wellness',              parentCategory: 'personal_care' },
  ],
  subscriptions: [
    { id: 'video_streaming',      label: 'Video streaming',             parentCategory: 'subscriptions' },
    { id: 'music_streaming',      label: 'Music streaming',             parentCategory: 'subscriptions' },
    { id: 'news_reading',         label: 'News & reading',              parentCategory: 'subscriptions' },
    { id: 'software_productivity',label: 'Software & productivity',     parentCategory: 'subscriptions' },
    { id: 'cloud_storage',        label: 'Cloud storage',               parentCategory: 'subscriptions' },
    { id: 'gaming',               label: 'Gaming',                      parentCategory: 'subscriptions' },
    { id: 'other_subscription',   label: 'Other subscription',          parentCategory: 'subscriptions' },
  ],
  utilities: [
    { id: 'electricity_gas',      label: 'Electricity & gas',           parentCategory: 'utilities' },
    { id: 'water',                label: 'Water',                       parentCategory: 'utilities' },
    { id: 'internet',             label: 'Internet',                    parentCategory: 'utilities' },
    { id: 'mobile_phone',         label: 'Mobile / phone',              parentCategory: 'utilities' },
    { id: 'tv_landline',          label: 'TV & landline',               parentCategory: 'utilities' },
  ],
  shopping: [
    { id: 'clothing_accessories', label: 'Clothing & accessories',      parentCategory: 'shopping' },
    { id: 'electronics_gadgets',  label: 'Electronics & gadgets',       parentCategory: 'shopping' },
    { id: 'home_goods_decor',     label: 'Home goods & décor',          parentCategory: 'shopping' },
    { id: 'books_stationery',     label: 'Books & stationery',          parentCategory: 'shopping' },
    { id: 'online_retail',        label: 'Online retail',               parentCategory: 'shopping' },
    { id: 'sports_outdoor',       label: 'Sports & outdoor',            parentCategory: 'shopping' },
  ],
  travel: [
    { id: 'flights',              label: 'Flights',                     parentCategory: 'travel' },
    { id: 'accommodation',        label: 'Accommodation',               parentCategory: 'travel' },
    { id: 'ground_transport',     label: 'Ground transport',            parentCategory: 'travel' },
    { id: 'travel_insurance',     label: 'Travel insurance',            parentCategory: 'travel' },
    { id: 'activities_experiences',label: 'Activities & experiences',   parentCategory: 'travel' },
    { id: 'visa_travel_fees',     label: 'Visa & travel fees',          parentCategory: 'travel' },
  ],
  education: [
    { id: 'online_courses',       label: 'Online courses',              parentCategory: 'education' },
    { id: 'books_learning',       label: 'Books & learning materials',  parentCategory: 'education' },
    { id: 'tutoring_coaching',    label: 'Tutoring & coaching',         parentCategory: 'education' },
    { id: 'school_university',    label: 'School / university fees',    parentCategory: 'education' },
    { id: 'language_lessons',     label: 'Language lessons',            parentCategory: 'education' },
    { id: 'professional_dev',     label: 'Professional development',    parentCategory: 'education' },
  ],
  insurance: [
    { id: 'health_insurance',     label: 'Health insurance',            parentCategory: 'insurance' },
    { id: 'life_insurance',       label: 'Life insurance',              parentCategory: 'insurance' },
    { id: 'home_contents',        label: 'Home & contents',             parentCategory: 'insurance' },
    { id: 'travel_insurance_policy',label: 'Travel insurance',          parentCategory: 'insurance' },
    { id: 'vehicle_insurance',    label: 'Vehicle insurance',           parentCategory: 'insurance' },
    { id: 'other_insurance',      label: 'Other insurance',             parentCategory: 'insurance' },
  ],
  childcare: [
    { id: 'childcare_nursery',    label: 'Childcare & nursery',         parentCategory: 'childcare' },
    { id: 'school_fees',          label: 'School fees',                 parentCategory: 'childcare' },
    { id: 'after_school',         label: 'After-school activities',     parentCategory: 'childcare' },
    { id: 'kids_clothing_gear',   label: "Kids' clothing & gear",       parentCategory: 'childcare' },
    { id: 'toys_entertainment',   label: 'Toys & entertainment',        parentCategory: 'childcare' },
    { id: 'child_health',         label: 'Child health',                parentCategory: 'childcare' },
  ],
  gifts_giving: [
    { id: 'gifts',                label: 'Gifts',                       parentCategory: 'gifts_giving' },
    { id: 'charity_donations',    label: 'Charity & donations',         parentCategory: 'gifts_giving' },
    { id: 'religious_cultural',   label: 'Religious / cultural giving', parentCategory: 'gifts_giving' },
    { id: 'celebrations_events',  label: 'Celebrations & events',       parentCategory: 'gifts_giving' },
  ],
  other: [
    { id: 'other_uncategorised',  label: 'Uncategorised',               parentCategory: 'other' },
  ],
  income: [
    { id: 'salary',               label: 'Salary',                      parentCategory: 'income' },
    { id: 'freelance',            label: 'Freelance',                   parentCategory: 'income' },
    { id: 'interest_dividends',   label: 'Interest & dividends',        parentCategory: 'income' },
    { id: 'other_income',         label: 'Other income',                parentCategory: 'income' },
  ],
  investment_transfer: [
    { id: 'brokerage_transfer',   label: 'Brokerage transfer',          parentCategory: 'investment_transfer' },
    { id: 'sip_recurring',        label: 'SIP / recurring investment',  parentCategory: 'investment_transfer' },
    { id: 'pension_topup',        label: 'Pension top-up',              parentCategory: 'investment_transfer' },
    { id: 'savings_transfer',     label: 'Savings transfer',            parentCategory: 'investment_transfer' },
  ],
  transfer: [
    { id: 'family_remittance',    label: 'Family remittance',           parentCategory: 'transfer' },
    { id: 'friend_repayment',     label: 'Friend repayment',            parentCategory: 'transfer' },
    { id: 'inter_account',        label: 'Inter-account transfer',      parentCategory: 'transfer' },
    { id: 'other_transfer',       label: 'Other transfer',              parentCategory: 'transfer' },
  ],
}

// ── CATEGORY META ─────────────────────────────────────────────────────────────

export interface CategoryMeta {
  id: SpendCategory
  label: string
  excludedFromTotal: boolean
  showInBudgetSheet: boolean   // false for income / investment / transfer / other
  alwaysVisible: boolean       // childcare shows even with no spend
}

export const CATEGORY_META: CategoryMeta[] = [
  { id: 'housing',             label: 'Housing',            excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'groceries',           label: 'Groceries',          excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'eating_out',          label: 'Eating & Drinking',  excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'transport',           label: 'Transport',          excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'health',              label: 'Health',             excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'personal_care',       label: 'Personal Care',      excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'subscriptions',       label: 'Subscriptions',      excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'utilities',           label: 'Utilities',          excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'shopping',            label: 'Shopping',           excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'travel',              label: 'Travel',             excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'education',           label: 'Education',          excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'insurance',           label: 'Insurance',          excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'childcare',           label: 'Children & Family',  excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: true  },
  { id: 'gifts_giving',        label: 'Gifts & Giving',     excludedFromTotal: false, showInBudgetSheet: true,  alwaysVisible: false },
  { id: 'other',               label: 'Other',              excludedFromTotal: false, showInBudgetSheet: false, alwaysVisible: false },
  { id: 'income',              label: 'Income',             excludedFromTotal: true,  showInBudgetSheet: false, alwaysVisible: false },
  { id: 'investment_transfer', label: 'Investments',        excludedFromTotal: true,  showInBudgetSheet: false, alwaysVisible: false },
  { id: 'transfer',            label: 'Transfers',          excludedFromTotal: true,  showInBudgetSheet: false, alwaysVisible: false },
]

// ── SHARED TYPES ──────────────────────────────────────────────────────────────

export type SpendOwnership = 'personal' | 'joint' | 'split'

/**
 * SpendCategoryData — rich runtime data object representing one category's
 * spend for the current period. Used by SpendCategoryList / SpendCategoryRow.
 */
export interface SpendCategoryData {
  id: SpendCategory
  name: string
  icon: string                    // kept for backward compat; icons are now SVG
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
  institution: string
  accountType: 'personal' | 'joint' | 'managed'
  accountLabel: string
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
  category: SpendCategory
  subcategory?: string
  geography: 'india' | 'europe' | 'other'
  ownership: SpendOwnership
  splitWithProfileId?: string
  splitRatio?: number
  isRecurring: boolean
  recurringGroupId?: string
  rawDescription: string
  isExcluded: boolean
  dataSource: 'CSV' | 'MANUAL'
  tags?: string[]
  merchantNorm?: string
  currencyOriginal?: string
  amountOriginal?: number
  fxRateApplied?: number | null
  importedAt?: Date
}

export interface SpendSubcategory {
  id: string
  name: string
  amount: number
  currency: string
  transactionCount: number
  transactions: SpendTransaction[]
}

export interface SpendBudget {
  id: string
  householdId: string
  profileId: string | 'household'
  category: SpendCategory
  monthlyAmount: number
  currency: string
}
