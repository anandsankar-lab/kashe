# Kāshe — Product Requirements Document
*Version 1.0 — February 2026*
*Status: Section 1–3 (Home) complete. Spend, Portfolio, Insights TBD.*

---

## HOW TO READ THIS DOCUMENT
*(For AI agents — read this first)*

This PRD is layered. Each section has a **TL;DR** at the top.
Read the TL;DR. Only go deeper if your task requires it.

**Do not implement anything marked:**
- `[V2]` — planned but not now
- `[NEVER]` — explicitly out of scope
- `[DEFERRED]` — decided but not yet specced

**When in doubt, do less. Ask the PM.**

---

## SECTION 1 — PRODUCT OVERVIEW

**TL;DR**
Kāshe is a mobile personal finance app for globally mobile Indian professionals. It tracks spending (CSV upload), investments (multi-geography portfolio), and financial position. It is NOT a net worth tracker, tax tool, or bank. Built in React Native (Expo). iOS + Android. Both dark and light mode from day one.

---

### 1.1 Vision
Personal finance companion for people who live between worlds — primarily India and Europe/US/UK. One clean app that understands their money doesn't live in one country and neither do they.

### 1.2 Name & Brand
**Name:** Kāshe (brand mark) / Kashe (App Store, URL, keyboards)
**Etymology:** From കാശ് — the everyday Malayalam word for money
**Accent:** The macron (ā) is a design element only, not typed by users

### 1.3 Design System — LOCKED

```
COLOURS
Background light:   #F5F4F0   warm off-white
Background dark:    #111110   warm near-black
Surface light:      #FFFFFF
Surface dark:       #1C1C1A
Border light:       #E8E8E3
Border dark:        #2A2A28
Text primary:       #1A1A18
Text secondary:     #8A8A85
Text dim:           #C4C4BF
Brand accent:       #C8F04A   acid green — used sparingly
Danger:             #FF5C5C
Warning:            #FFB547
Success:            #C8F04A   (same as accent)

TYPOGRAPHY
Display/Numbers:    Syne 800, tight letter-spacing
Headings:           Syne 700
Body:               DM Sans 400/500
Labels:             DM Sans 500, uppercase, tracked

LOGO MARK
6-point asterisk. 5 strokes: #8A8A85. 1 stroke (the k): #C8F04A.
The ā macron: same weight, same green.

MOTION
Micro-animations:   200–300ms, ease-out
Price updates:      gentle tick on number change
Transitions:        slide (not fade) — feels native
Loading:            single pulsing accent dot, no spinners

SPACING
Base unit:          4px grid
Border radius:      16px cards, 12px inputs, 999px pills
Shadows:            none — borders only, flat design

DARK/LIGHT
Both from day one. Follows system setting (useColorScheme).
All colour tokens defined for both modes.
```

### 1.4 Tech Stack — LOCKED

```
Framework:          React Native via Expo (managed workflow)
Navigation:         Expo Router (file-based)
State:              Zustand (lightweight, simple)
Storage:            react-native-encrypted-storage
                    (iOS Keychain / Android Keystore)
Auth:               Google OAuth via expo-auth-session
Fonts:              Expo Google Fonts (Syne + DM Sans)
Blur effect:        @react-native-community/blur (iOS)
                    Semi-transparent overlay (Android)
Analytics:          PostHog (anonymised, no PII)
Price APIs:         Alpha Vantage, Finnhub (free tier)
                    AMFI NAV feed (Indian MFs, free)
                    CoinGecko (crypto, free)
FX rates:           ExchangeRate-API (free tier)
News:               Finnhub news API (filtered by ticker)
Backend (v1b):      Supabase (couple sync only)
```

### 1.5 Scope Boundary — HARD LIMITS

```
IN SCOPE
✓ Spend tracking via CSV upload
✓ Investment portfolio (financial instruments only)
✓ Liabilities (mortgage, loans, credit card)
✓ Financial Position = Portfolio − Liabilities
✓ AI-powered insights
✓ Multi-geography (India + Europe/US/UK)
✓ Multi-profile (couple + managed profiles for parents)
✓ FIRE calculator (in Insights tab)

OUT OF SCOPE — NEVER BUILD
✗ Physical assets (car, art, jewellery, watches)
✗ Tax filing or tax calculations
✗ Payment / money transfer
✗ Social features or comparisons
✗ Ads or data monetisation
✗ Generic market news feed
✗ Gamification (badges, streaks)
✗ Business/company finances

DEFERRED — V2
◐ Open banking API sync (Nordigen EU, AA India, Plaid US)
◐ Push notifications
◐ Partner spend visible on Home
◐ Sparkline charts
◐ Tax fields surface (data captured in v1, not shown)
◐ Property market estimate (Funda/Kadaster for NL)
```

---

## SECTION 2 — USERS & DATA

**TL;DR**
Target user: Indian professional, 32–45, living in Europe/US/UK, investments in both India and abroad. App supports households (couples + managed profiles for parents). Auth: Google OAuth only. Data: CSV upload only in v1, local encrypted storage, never sent to server.

---

### 2.1 Primary User
Indian professional abroad. Has mutual funds in India, ETFs in Europe, employer stock, NRE/NRO accounts, possibly Crowdcube investments. Two currencies minimum. Knows they're doing okay but can't see the full picture.

**User test:** *Would a 38-year-old Indian engineer in Amsterdam with Indian MFs and DeGiro ETFs find this genuinely useful?*

### 2.2 Household & Profile Model

```
Household
├── id
├── name
├── base_currency (country of residence)
└── Profiles[]
    ├── id
    ├── name
    ├── type: OWNER | PARTNER | MANAGED
    ├── google_auth_id  (null for MANAGED profiles)
    ├── base_currency
    ├── country_of_residence
    └── Assets[]

PROFILE TYPES
OWNER:    Full access. Can add/remove profiles.
PARTNER:  Full access. Manages own assets. [V2 — requires couple sync]
MANAGED:  No login needed. Administered by OWNER.
          Use case: parents' investments tracked by adult child.

PROFILE LIMIT
v1:       Unlimited profiles (freemium gate added later)
Freemium: >2 profiles = PREMIUM [flag for future, don't build now]
```

### 2.3 Home Screen View Toggle
Default: Household view (combined all profiles).
Switch: Tap avatar (top left) → profile sheet → select profile.
Avatar sheet shows: Household ✓ / Anand / Puhoop / Amma & Achan / + Add profile.

### 2.4 Input Model

```
FILE FORMAT:    CSV only. No Excel, PDF, OFX, MT940.

SUPPORTED INSTITUTIONS v1:
Institution          Region   Covers
─────────────────────────────────────────────
ABN Amro             🇳🇱      Spending
DeGiro               🇪🇺      EU brokerage
HDFC Bank            🇮🇳      Spending + savings
CAMS                 🇮🇳      All Indian MFs
Zerodha / Groww      🇮🇳      Indian Demat
Morgan Stanley       🌍       RSU / ESPP
Revolut              🇪🇺      Spending

Everything else: manual entry.
```

### 2.5 Data Tiers

```
TIER 1 — LIVE (CSV-driven, updated regularly)
Spending, EU brokerage, Indian MFs, Indian Demat.

TIER 2 — SLOW (manual entry, updated rarely)
Pension, PPF/EPF, NRE/NRO balance, crypto (optional CSV).
Enter once, revisit occasionally.

TIER 3 — STATIC (manual, updated annually or on events)
Mortgage, other loans, credit card balance,
Crowdcube/Seedrs investments, property equity estimate.
```

### 2.6 Auto Price Refresh

```
EU/US stocks & ETFs:    Alpha Vantage / Finnhub
Indian stocks:          Alpha Vantage (NSE/BSE tickers)
Indian MFs:             AMFI NAV feed (free, no key)
Crypto:                 CoinGecko (free, no key)
FX rates:               ExchangeRate-API

Trigger: On every app open, background refresh.
Animation: Gentle tick as numbers update.
Timestamp: "Last refreshed X min ago" shown dimly.

Does NOT auto-refresh: property, Crowdcube, angel,
PPF/EPF, NRE/NRO cash, credit card balance.
```

### 2.7 Data Freshness Cadence

```
Spending CSV:       nudge after 14 days
EU Brokerage:       nudge after 30 days
Indian MFs:         nudge after 30 days
NRE/NRO balance:    nudge after 90 days
Employer stock:     nudge after each vesting event
PPF/EPF:            nudge annually (April — Indian FY)
Credit card:        amber warning after 7 days
Property:           nudge annually

v1: In-app nudges only. Freshness dot on cards.
[V2]: Opt-in push notifications.
```

### 2.8 Security & Privacy

```
PIPELINE (every CSV upload):
  Parse in memory → sanitise → extract → encrypt → store
  Raw CSV: never persisted, discarded immediately.

SANITISATION:
  Account numbers: masked, keep last 4 digits
  IBANs: masked
  BSN/PAN/Aadhaar: removed
  Full names in refs: partially masked

STORAGE:
  AES-256 via iOS Keychain / Android Keystore
  Key: derived from Google OAuth token + device ID
  Logout: key invalidated, data unreadable

IN TRANSIT [V1b — couple sync]:
  TLS baseline + E2E encryption
  Supabase stores ciphertext only — zero knowledge
  Partner pairing: one-time QR scan

POST-UPLOAD CONFIRMATION (always shown):
  "✓ X transactions imported"
  "✓ Account numbers masked"
  "✓ Raw file discarded"
  "✓ Data encrypted on your device"

ANALYTICS: PostHog, anonymised only. No PII ever.
MONETISATION: Subscription only. Never data.
```

### 2.9 Currency & FX

```
Base currency: country of residence (set in onboarding)
Override: Settings → Display Currency
Display: native currency + converted equivalent beneath
Example: ₹11,07,238  (~€11,200)
FX: auto-refreshed via ExchangeRate-API on app open
```

### 2.10 Liabilities Data Model

```
Liability
├── id
├── profile_id
├── type: MORTGAGE | PERSONAL_LOAN | CAR_LOAN |
│         STUDENT_LOAN | CREDIT_CARD
├── name (e.g. "ABN Amro Mortgage")
├── outstanding_balance
├── currency
├── monthly_payment
├── interest_rate
├── fixed_rate_expiry_date  (mortgage only)
├── credit_limit            (credit card only)
├── apr                     (credit card only)
├── end_date                (loans only)
├── linked_property_id      (mortgage only, optional)
└── last_updated_date

Credit card balance: manual snapshot.
Amber warning if not updated in 7+ days.
Show credit utilisation = balance ÷ limit.
```

### 2.11 Asset Data Model

```
Asset
├── id
├── profile_id
├── owner: user_a | user_b | joint
├── type: STOCK | ETF | MUTUAL_FUND | CRYPTO |
│         CASH | EMPLOYER_STOCK | PENSION |
│         ALTERNATIVE | PROPERTY_EQUITY
├── name
├── ticker / isin / fund_code  (if applicable)
├── quantity / units
├── purchase_price             (for future tax — capture now)
├── purchase_date              (for future tax — capture now)
├── purchase_currency
├── current_price              (auto-refreshed where possible)
├── current_currency
├── geography: INDIA | EUROPE | US | UK | OTHER
├── risk_tier: MEDIUM | HIGH | CASH_LOW
├── is_illiquid: boolean       (Crowdcube, property equity etc)
├── is_employer_stock: boolean
├── vesting_date               (RSU/ESPP only)
├── last_price_update
└── data_source: CSV | MANUAL | API
```

### 2.12 Deferred — Do Not Build in v1

```
[DEFERRED] Open banking (Nordigen, Account Aggregator, Plaid)
           Architecture: abstract behind DataSource interface.
           v1 implements CSVDataSource.
           v2 adds OpenBankingDataSource — no model changes.

[DEFERRED] Taxation display
           Data captured (purchase_price, purchase_date) ✓
           Tax calculations and display: v2.

[DEFERRED] LIC / Insurance policies
[DEFERRED] Angel / syndicate investments (full model)
[DEFERRED] Couple sync (Supabase E2E) — v1b after core stable
```

---

## SECTION 3 — SCREENS & FEATURES

**TL;DR**
4-tab app: Home / Spend / Portfolio / Insights.
Plus: Onboarding stack, Settings, Upload flow (bottom sheet).
FIRE calculator lives in Insights.
Every empty state shows blurred ghost UI + [+] CTA.
Universal add sheet ([+] button) accessible from everywhere.

---

### 3.0 Navigation Structure

```
BOTTOM TABS (4)
  Home        Financial position snapshot
  Spend       Transaction analysis
  Portfolio   Investment holdings
  Insights    AI analysis + FIRE calculator

OUTSIDE TABS
  Onboarding  Separate stack, runs once on first launch
  Settings    Profile, currency, security, data sources
  Upload      Bottom sheet — accessible from everywhere via [+]
  Detail      Drill-down on any individual asset or transaction
```

### 3.1 Universal Add Sheet

```
TRIGGER: [+] button, top right, every screen. Always visible.

CONTENT (always same 4 options, context adjusts emphasis):
  💳 Upload bank statement     (emphasised on Spend screen)
  📈 Upload portfolio CSV      (emphasised on Portfolio screen)
  ✋ Add manually
  👤 Add a profile

BEHAVIOUR:
  Opens as bottom sheet — user never leaves current screen
  Upload completes → sheet dismisses → screen refreshes
  Manual add: progressive 3-step form within sheet
    Step 1: Geography (India / Europe / Alternative / Cash)
    Step 2: Asset type (contextual to geography)
    Step 3: Minimal form (only required fields)
  "Whose investment?" dropdown on every form
    Shows all household profiles + "+ Add new profile"
    New profile creatable mid-flow without losing place

NOTIFICATION DOT on [+]:
  Amber: a data source is stale
  Red: monthly spend >90% of budget
  Amber: vesting event due within 7 days
```

### 3.2 Empty State Pattern (All Screens)

```
PRINCIPLE: Empty states are invitations, not errors.

PATTERN:
  Full blurred ghost of the populated screen
  (Fixed mock data constants — realistic fake numbers)
  Frosted card centred over blur:
    Kāshe asterisk motif (slow pulse animation)
    One honest headline
    One [+] CTA button (acid green)
    One secondary text link

RULES:
  Never show a financial number as zero
  Partial data: card-level empty states, not full screen
  Blur library: @react-native-community/blur (iOS)
                Semi-transparent overlay (Android)
  Mock data: fixed constants in /constants/mockData.ts
             Same data used on every empty state
```

### 3.3 Home Screen — FULLY SPECCED

**Job:** One glance, complete orientation. Opens on Household view.

```
HEADER
  Left:    Avatar → profile switcher sheet
  Centre:  Time-aware greeting ("Good morning, Anand") + date
  Right:   [+] with notification dot

YOUR POSITION HERO CARD
  Primary:   Financial Position (Portfolio − Liabilities)
  Formula:   Liquid assets + Illiquid assets − Liabilities
  Divider:   ā macron rule (1px, acid green) between assets/liabilities
  Breakdown: Assets [liquid] / Assets [illiquid ⓘ] / Liabilities
             Expandable — collapsed by default
  Delta:     ↑↓ vs last month + ↑↓ YTD (both shown)
  Illiquid ⓘ tooltip: "Includes property equity and startup
             investments — can't be quickly converted to cash"

SAVINGS RATE (top right of hero card)
  Formula:   (income − spend) ÷ income × 100
  Display:   45% ↑ with monthly delta
  Calculated locally — no AI needed

INVESTMENT SEGREGATION (toggle)
  Pills:     [Risk]  [Vehicle]  [Geography]
  Remembers last selected view
  By Risk:   Medium / High / Cash_Low bars vs 60/20/20 target
             Shows variance: "⚠ Overweight medium"
  By Vehicle: MFs / Stocks / ETFs / Managed / Employer / Cash
  By Geography: 🇮🇳 India / 🇪🇺 Europe / 🌍 Other

SPEND SNAPSHOT
  Progress bar: spent vs user-declared monthly budget
  Colours: Green <80%, Amber 80–99%, Red 100%+
  Text: "Spent €2,847 of €4,500"
  Tap: → Spend tab

MARKETS STRIP
  Horizontal scroll, auto-refresh on open
  Items: S&P 500 / NIFTY 50 / EUR/INR / Gold
  Format: "S&P 500  ↑ 0.4%"

PORTFOLIO PULSE
  5 items max, holdings-specific only (not generic news)
  Source: Finnhub news API filtered by owned tickers
  Format: "GOOGL  ↑2.3%  Q4 earnings beat  →"
  Tap: → in-app browser

FIRE PROGRESS (single line)
  "████████████░░░░  63% — Financial independence 2032"
  Tap: → Insights tab, FIRE calculator

COVERAGE CARD
  "Portfolio coverage: 73%"
  "[+ Add missing assets]" → universal add sheet, filtered to gaps
  Hidden if coverage = 100%

INTERACTIONS
  Tap geography pill:    → Portfolio, filtered to geography
  Tap spend bar:         → Spend tab
  Tap portfolio pulse:   → in-app browser
  Tap FIRE bar:          → Insights tab
  Tap coverage link:     → universal add sheet
  Pull to refresh:       re-fetches prices + spend totals
  Tap [+]:               → universal add sheet

EMPTY STATE
  Blurred ghost of populated Home
  Mock position: €450,000
  Frosted card: "Build your picture"
  CTA: [+ Upload now]
  Secondary: "Add investments instead" (text link)
```

**v1/v2/Never for Home:**
```
V1:   All of the above
[V2]: Sparkline chart behind position number
[V2]: Partner spend on Home
[V2]: Upcoming vesting events widget
[V2]: AI narrative on savings rate drop/rise
[NEVER]: News feed, ads, social, gamification
```

### 3.4 Spend Screen — TO BE SPECCED

*[Spec in progress — coming after lunch break]*

Key decisions already made:
- CSV upload via universal add sheet
- ABN Amro, HDFC, Revolut supported in v1
- Categories auto-detected from transaction descriptions
- Monthly view with month selector
- AI insights on spend patterns
- Blurred ghost empty state

### 3.5 Portfolio Screen — TO BE SPECCED

*[Spec in progress]*

Key decisions already made:
- Grouped by geography (India / Europe / Other)
- Coverage score replaces "onboarding complete"
- Property equity as optional illiquid entry
- Auto price refresh on open
- Freshness indicators per holding

### 3.6 Insights Screen — TO BE SPECCED (HIGHEST PRIORITY)

*[Spec in progress — this is the most important screen to spec deeply]*

**Why this screen needs the most thorough spec:**
The financial intelligence layer is what makes Kāshe genuinely
valuable vs a pretty spreadsheet. It must be specced before
Team Member 3 (Financial Intelligence) starts work.

Key decisions already made:
- AI-powered, uses Claude API (claude-sonnet-4-20250514)
- FIRE calculator lives here
- FIRE usable with manual inputs alone (no upload required)
- Blurred teaser if insufficient data

**Still to be specced (do not build until complete):**

INSIGHT TYPES (10 to be defined):
- Spend pattern anomalies (dining 34% above last month)
- Employer stock concentration risk (threshold: >20% in one stock)
- Indian MF overlap analysis (detect hidden concentration)
- INR/EUR currency risk (flag when INR weakens >3% in rolling 90 days)
- Savings rate trajectory (improving/declining over 3 months)
- Portfolio drift from target allocation
- Vesting event preparation (flag upcoming vesting + concentration impact)
- Spend-to-invest ratio (savings rate vs actual investment rate)
- Emergency fund coverage (months of spend covered by liquid cash)
- FIRE trajectory change (has your projected date moved?)

FINANCIAL FRAMEWORKS:
- Allocation target: 60% medium / 20% high / 20% cash-low
  Justification: to be documented in ADR-006
  Nuance: user's age, income stability, India exposure affect this
- FIRE assumptions:
  Default return: 7% (conservative blended, accounts for INR drag)
  Indian equity component: 12% INR - 3.5% INR depreciation = ~8.5% EUR real
  Safe withdrawal rate: 4% (Bengen rule, adjust for India exposure)
  Primary residence: excluded from FIRE number by default, flagged
- Concentration risk thresholds:
  Single stock: warn >15%, alert >25%
  Single geography: warn >70%
  Single asset type: warn >60%
- MF overlap: flag if top 10 holdings overlap >60% across funds

AI PROMPT ARCHITECTURE:
- Never send raw transactions to Claude API
- Send aggregated category totals only
- Send portfolio percentages, not absolute values
- One insight per API call (cost control)
- Cache insights for 24 hours (don't regenerate on every open)

### 3.7 Onboarding Stack — SPECCED, DETAIL DEFERRED

```
8 screens, linear, runs once on first launch.
Completable in <3 min with one file upload.
Skippable in <30 sec.

SCREENS (in order):
1. Welcome         Kāshe mark + Google OAuth
2. Household       Single or couple?
3. Location        Country + base currency
4. Teach [+]       Static illustration, introduce the gesture
5. First add       Guided universal add sheet (isOnboarding=true)
6. First payoff    Real data OR blurred ghost — both valid
7. Portfolio teaser Blurred ghost + [+ Add investments]
8. Complete        "Tap [+] anytime to add more" → main app

GUIDED MODE:
isOnboarding prop on UniversalAddSheet.
Shows tooltip arrow + "Start here — it's fastest" on bank CSV.
Disappears after onboarding complete.

ARCHITECTURE:
Separate navigation stack from main app.
onboardingComplete: boolean in encrypted storage.
True → main app loads. False → onboarding stack loads.
```

### 3.8 Settings Screen — TO BE SPECCED

*[Spec in progress]*

Key items: Display currency, household profiles, data sources,
security (biometric/PIN), about, privacy policy, delete account.

---

## SECTION 4 — FEATURE FLAGS

**TL;DR**
All features tagged FREE / FREEMIUM / PREMIUM in a single file.
App is free at launch. Gates added later without structural changes.

```
/constants/featureFlags.ts

FREE
  spend_analysis
  portfolio_overview
  basic_fire_calculator
  csv_upload
  auto_price_refresh
  dark_light_mode
  single_profile

FREEMIUM
  ai_insights          (3 analyses/month free, unlimited paid)
  fire_full_detail     (basic free, full calculator paid)
  data_export          (1 export/month free)
  additional_profiles  (2 profiles free, unlimited paid)

PREMIUM
  couple_sync          (requires backend anyway)
  multi_currency_view
  advanced_ai_advice
```

Paywall UX: benefit-led bottom sheet. Never an error.
*"Unlock unlimited AI insights"* not *"You've used your 3 free analyses."*

---

## SECTION 5 — AGENT INSTRUCTIONS

**TL;DR**
Build one screen at a time. Read only the spec for your current task.
Never implement [V2] or [NEVER] items. When in doubt, do less.

---

### 5.1 How to Work with This PRD

```
BEFORE STARTING ANY TASK:
1. Read the TL;DR of relevant sections only
2. Note any [V2] or [DEFERRED] items — skip them
3. Build the minimum that satisfies the spec
4. Run on device (Expo Go) before marking done

COMPONENT RULES:
- One component, one job
- Colours: only from design system tokens
- Never hardcode a colour value
- Dark/light: every component handles both modes
- Empty states: every screen has one

FILE STRUCTURE:
/app              Expo Router screens
/components       Reusable UI components
/constants        colours.ts, typography.ts,
                  featureFlags.ts, mockData.ts
/hooks            useColorScheme, usePortfolio, useSpend
/services         priceRefresh.ts, csvParser.ts,
                  dataSource.ts (abstraction layer)
/store            Zustand stores
/types            TypeScript interfaces

START HERE (build in this order):
1. Design tokens (/constants/colours.ts etc)
2. Core components (Card, Button, Typography)
3. Navigation shell (4 tabs, empty screens)
4. Home screen
5. Universal add sheet + CSV parser
6. Spend screen
7. Portfolio screen
8. Insights screen
9. Onboarding stack
10. Settings
```

### 5.2 Specialised Agent Breakdown

```
AGENT 1 — Design System
Task: Create /constants/ files and base components only.
Reads: Section 1.3 (design system) only.
Output: colours.ts, typography.ts, spacing.ts,
        Button, Card, Typography, Avatar components.
Does NOT touch: screens, navigation, data.

AGENT 2 — Navigation Shell
Task: Expo Router setup, 4-tab navigation, empty screens.
Reads: Section 3.0 (navigation structure) only.
Output: Working app with 4 tabs, correct fonts loaded,
        dark/light mode working, no content yet.
Does NOT touch: data, business logic, components.

AGENT 3 — Home Screen
Task: Build Home screen UI only. Static/mock data.
Reads: Section 1.3 (design tokens), 3.3 (Home spec) only.
Output: Pixel-perfect Home screen, both modes,
        all components, mock data, empty state.
Does NOT touch: real data, CSV parsing, APIs.

AGENT 4 — CSV Parser + Data Layer
Task: CSV parsing for all 7 institutions + data model.
Reads: Section 2.4 (input model), 2.5 (tiers),
       2.8 (security pipeline), 2.11 (asset model).
Output: csvParser.ts, dataSource.ts, Zustand stores,
        encrypted storage integration.
Does NOT touch: UI screens.

AGENT 5 — Price Refresh Service
Task: API integrations for auto price refresh.
Reads: Section 2.6 (auto price refresh) only.
Output: priceRefresh.ts service,
        AMFI NAV parser, Finnhub integration,
        ExchangeRate-API integration.
Does NOT touch: UI, CSV parsing, storage.

AGENT 6 — Spend Screen
Task: Build Spend screen UI + wire to data layer.
Reads: Section 1.3, 3.4 (when specced).
Depends on: Agent 3 components, Agent 4 data layer.

AGENT 7 — Portfolio Screen
Task: Build Portfolio screen UI + wire to data layer.
Reads: Section 1.3, 3.5 (when specced).
Depends on: Agent 3 components, Agent 4 + 5.

AGENT 8 — Insights + FIRE
Task: Build Insights screen, Claude API integration, FIRE calc.
Reads: Section 1.3, 3.6 (when specced).
Depends on: Agent 3 components, Agent 4 data layer.

AGENT 9 — Onboarding
Task: Build onboarding stack.
Reads: Section 3.7 (onboarding spec).
Depends on: All previous agents complete.

AGENT 10 — QA
Task: Test each screen against spec. Find gaps.
Reads: Full PRD.
Output: Bug list, spec violations, missing empty states.
```

---

## APPENDIX — QUICK REFERENCE

### Supported Institutions & Their CSV Formats
*(Detail to be added as each parser is built)*

### AMFI NAV Feed
URL: `https://www.amfiindia.com/spages/NAVAll.txt`
Format: Pipe-delimited, updated daily after market close.
No API key required.

### Finnhub News API
Endpoint: `https://finnhub.io/api/v1/company-news`
Filter by symbol. Free tier: 60 calls/minute.
Used for Portfolio Pulse on Home screen.

### ExchangeRate-API
Endpoint: `https://open.er-api.com/v6/latest/EUR`
Free tier: 1,500 requests/month. No key for basic usage.

### Key Design Decisions Log
*(For context — do not re-debate these)*

```
CSV only (no Excel/PDF)       — reliability over breadth
Local-first storage           — privacy by architecture
Google OAuth only             — no password management
4-tab navigation              — mobile sweet spot
FIRE in Insights tab          — AI-driven analysis
Acid green #C8F04A            — brand accent, used sparingly
"Your Position" not "Net worth" — sets correct expectations
Physical assets out of scope  — clean product boundary
DataSource abstraction        — open banking ready for v2
featureFlag system            — freemium ready without refactor
Household + Managed profiles  — covers couples + parents
Savings rate % for health     — simple, honest, actionable
Blurred ghost empty states    — invitations not errors
```

---

*PRD maintained by: Anand (PM)*
*Last updated: February 2026*
*Next: Spend screen spec*
