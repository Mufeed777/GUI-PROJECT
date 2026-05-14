const LKR_RATE = 311

export const toLKR = (usd: number): number => usd * LKR_RATE

export const formatLKR = (usd: number, decimals = 2): string => {
  return `Rs. ${toLKR(usd).toFixed(decimals)}`
}

export const lkrPriceParts = (usd: number) => {
  const parts = toLKR(usd).toFixed(2).split('.')
  return {
    whole: parts[0],
    cents: parts[1] || '00'
  }
}
