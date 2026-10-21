import { describe, expect, it } from 'vitest'
import { evaluateExpression } from '../utils/mathEngine'

describe('evaluateExpression', () => {
  it('evaluates roots, powers, reciprocals, absolute values, and factorials', () => {
    expect(evaluateExpression('sqrt(9)')).toBe(3)
    expect(evaluateExpression('cbrt(-8)')).toBe(-2)
    expect(evaluateExpression('root(-8, 3)')).toBe(-2)
    expect(evaluateExpression('root(-8, -3)')).toBe(-0.5)
    expect(evaluateExpression('root(16, 2.5)')).toBeCloseTo(3.031433133, 8)
    expect(evaluateExpression('2^3')).toBe(8)
    expect(evaluateExpression('1/(-5)')).toBe(-0.2)
    expect(evaluateExpression('abs(-5)')).toBe(5)
    expect(evaluateExpression('5!')).toBe(120)
    expect(evaluateExpression('(-2)^2')).toBe(4)
    expect(evaluateExpression('-2^2')).toBe(-4)
  })

  it('evaluates supported logarithmic, exponential, and trigonometric functions', () => {
    expect(evaluateExpression('ln(e)')).toBe(1)
    expect(evaluateExpression('log(100)')).toBe(2)
    expect(evaluateExpression('log10(100)')).toBe(2)
    expect(evaluateExpression('exp(0)')).toBe(1)
    expect(evaluateExpression('sin(90)')).toBeCloseTo(1, 14)
    expect(evaluateExpression('sin(pi/2)', { angleMode: 'radians' })).toBe(1)
    expect(evaluateExpression('asin(1)')).toBe(90)
    expect(evaluateExpression('cos(180)')).toBe(-1)
    expect(evaluateExpression('atan(1)')).toBe(45)
  })

  it('supports function definitions, variables, and implicit multiplication', () => {
    expect(
      evaluateExpression('f(x) = x^2 + 3x + 2', { variable: 2 }),
    ).toBe(12)
    expect(evaluateExpression('f(x) = 2x + 1', { variable: 3 })).toBe(7)
    expect(() =>
      evaluateExpression('(x + 1) / (x - 2)', { variable: 2 }),
    ).toThrow('Cannot divide by zero.')
    expect(evaluateExpression('3x', { variable: 4 })).toBe(12)
    expect(evaluateExpression('2(x+1)', { variable: 4 })).toBe(10)
  })

  it('rejects invalid domains, malformed expressions, and arbitrary code', () => {
    expect(() => evaluateExpression('sqrt(-1)')).toThrow('Square root requires')
    expect(() => evaluateExpression('ln(0)')).toThrow('Natural logarithm requires')
    expect(() => evaluateExpression('asin(2)')).toThrow('between -1 and 1')
    expect(() => evaluateExpression('tan(90)')).toThrow('Tangent is undefined')
    expect(() => evaluateExpression('root(-8, 2)')).toThrow('odd integer')
    expect(() => evaluateExpression('5.5!')).toThrow('whole number')
    expect(() => evaluateExpression('1/0')).toThrow('Cannot divide by zero')
    expect(() => evaluateExpression('1e-300^2')).toThrow('too small to represent')
    expect(() => evaluateExpression('0^0')).toThrow('undefined')
    expect(() => evaluateExpression('(-2)^0.5')).toThrow('integer exponent')
    expect(() => evaluateExpression('exp(-1000)')).toThrow('too small to represent')
    expect(() => evaluateExpression('2 + )')).toThrow()
    expect(() => evaluateExpression('1 2')).toThrow()
    expect(() => evaluateExpression('1e309')).toThrow('finite number')
    expect(() => evaluateExpression('globalThis.alert(1)')).toThrow()
    expect(() => evaluateExpression('x + 1')).toThrow('only available')
  })
})
