import { describe, expect, it } from 'vitest'
import {
  applyPercent,
  evaluateTokens,
  type CalculatorToken,
} from '../utils/calculatorEngine'
import { formatNumber } from '../utils/formatNumber'

describe('evaluateTokens', () => {
  it.each([
    [['2', '+', '3'], 5],
    [['10', '-', '4'], 6],
    [['7', '×', '8'], 56],
    [['20', '÷', '4'], 5],
    [['0.1', '+', '0.2'], 0.3],
    [['-5', '+', '2'], -3],
    [['2', '+', '3', '×', '4'], 14],
    [['8', '÷', '4', '×', '2'], 4],
  ] as const)('evaluates %j', (rawTokens, expected) => {
    const tokens = rawTokens.map((token) =>
      ['+', '-', '×', '÷'].includes(token) ? token : Number(token),
    ) as CalculatorToken[]
    expect(evaluateTokens(tokens)).toBe(expected)
  })

  it('rejects division by zero and incomplete expressions', () => {
    expect(() => evaluateTokens([20, '÷', 0])).toThrow('Cannot divide by zero.')
    expect(() => evaluateTokens([2, '+'])).toThrow('complete calculation')
    expect(() => evaluateTokens([])).toThrow('complete calculation')
  })

  it('supports familiar percentage rules', () => {
    expect(applyPercent(10, 200, '+')).toBe(20)
    expect(evaluateTokens([200, '+', applyPercent(10, 200, '+')])).toBe(220)
    expect(evaluateTokens([200, '-', applyPercent(10, 200, '-')])).toBe(180)
    expect(evaluateTokens([200, '×', applyPercent(10, 200, '×')])).toBe(20)
    expect(evaluateTokens([200, '÷', applyPercent(10, 200, '÷')])).toBe(2000)
    expect(applyPercent(-10, undefined, undefined)).toBe(-0.1)
  })
})

describe('formatNumber', () => {
  it('formats ordinary numbers without floating-point artifacts', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3')
    expect(formatNumber(-0)).toBe('0')
  })

  it('uses scientific notation for extreme magnitudes', () => {
    expect(formatNumber(1e15)).toBe('1e+15')
    expect(formatNumber(1e-9)).toBe('1e-9')
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('Error')
  })
})
