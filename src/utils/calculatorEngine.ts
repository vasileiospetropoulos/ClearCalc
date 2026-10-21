export type Operator = '+' | '-' | '×' | '÷'
export type CalculatorToken = number | Operator

const isOperator = (token: CalculatorToken): token is Operator =>
  typeof token === 'string'

const normalizeResult = (value: number): number => {
  if (!Number.isFinite(value)) {
    throw new Error('Result is outside the supported number range.')
  }

  return Object.is(value, -0) ? 0 : Number(value.toPrecision(15))
}

export function evaluateTokens(tokens: readonly CalculatorToken[]): number {
  if (tokens.length === 0 || tokens.length % 2 === 0) {
    throw new Error('Enter a complete calculation.')
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const expectedOperator = index % 2 === 1
    if (expectedOperator !== isOperator(tokens[index])) {
      throw new Error('Enter a valid calculation.')
    }
    if (!expectedOperator && !Number.isFinite(tokens[index] as number)) {
      throw new Error('Enter a valid number.')
    }
  }

  const reduced: CalculatorToken[] = [tokens[0]]
  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index]
    const right = tokens[index + 1] as number
    const left = reduced[reduced.length - 1] as number

    if (operator === '×' || operator === '÷') {
      if (operator === '÷' && right === 0) {
        throw new Error('Cannot divide by zero.')
      }
      reduced[reduced.length - 1] =
        operator === '×' ? left * right : left / right
    } else {
      reduced.push(operator, right)
    }
  }

  let result = reduced[0] as number
  for (let index = 1; index < reduced.length; index += 2) {
    const operator = reduced[index]
    const right = reduced[index + 1] as number
    result = operator === '+' ? result + right : result - right
  }

  return normalizeResult(result)
}

export function applyPercent(
  currentValue: number,
  previousOperand: number | undefined,
  pendingOperator: Operator | undefined,
): number {
  if (
    previousOperand !== undefined &&
    (pendingOperator === '+' || pendingOperator === '-')
  ) {
    return normalizeResult((previousOperand * currentValue) / 100)
  }
  return normalizeResult(currentValue / 100)
}

export function formatExpressionToken(token: CalculatorToken): string {
  return typeof token === 'number' ? String(token) : token
}
