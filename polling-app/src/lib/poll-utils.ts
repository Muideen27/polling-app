export interface OptionWithCount {
  id: number
  label: string
  count: number
}

export interface NormalizedResults {
  total: number
  rows: Array<{
    id: number
    label: string
    count: number
    percent: string
  }>
}

/**
 * Normalizes poll results into a structured format with calculated percentages
 * @param optionsWithCounts - Array of options with their vote counts
 * @returns Normalized results with total votes and percentage calculations
 */
export function normalizeResults(optionsWithCounts: OptionWithCount[]): NormalizedResults {
  const total = optionsWithCounts.reduce((sum, option) => sum + option.count, 0)
  
  const rows = optionsWithCounts.map(option => ({
    id: option.id,
    label: option.label,
    count: option.count,
    percent: formatPercent(total > 0 ? (option.count / total) * 100 : 0)
  }))
  
  return { total, rows }
}

/**
 * Formats a number as a percentage string
 * @param n - Number to format (0-100)
 * @returns Formatted percentage string (e.g., "25%")
 */
export function formatPercent(n: number): string {
  return `${Math.round(n)}%`
}
