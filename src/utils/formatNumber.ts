export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return 'Error'
  if (Object.is(value, -0)) value = 0

  const absolute = Math.abs(value)
  if ((absolute !== 0 && absolute < 0.000001) || absolute >= 1_000_000_000_000) {
    return value.toExponential(14).replace(/\.?0+e/, 'e')
  }

  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 15,
    useGrouping: true,
  }).format(value)
}
