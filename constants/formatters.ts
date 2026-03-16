export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const symbol =
    currency === 'EUR' ? '€' :
    currency === 'INR' ? '₹' :
    currency === 'GBP' ? '£' :
    currency === 'USD' ? '$' :
    currency + ' '
  const formatted = Math.abs(Math.round(amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return (amount < 0 ? '-' : '') + symbol + formatted
}

export function formatCurrencyWithDecimals(amount: number, currency: string = 'EUR'): string {
  const symbol =
    currency === 'EUR' ? '€' :
    currency === 'INR' ? '₹' :
    currency === 'GBP' ? '£' :
    currency === 'USD' ? '$' :
    currency + ' '
  const abs = Math.abs(amount)
  const formatted = abs.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return (amount < 0 ? '-' : '') + symbol + formatted
}
