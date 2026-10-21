export type AngleMode = 'degrees' | 'radians'

type Token =
  | { type: 'number'; value: number }
  | { type: 'identifier'; value: string }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' | '^' | '!' }
  | { type: 'leftParen' | 'rightParen' | 'comma' }

const functions = new Set([
  'sqrt',
  'cbrt',
  'root',
  'abs',
  'factorial',
  'ln',
  'log',
  'log10',
  'exp',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
])

const finite = (value: number): number => {
  if (!Number.isFinite(value)) {
    throw new Error('The result is outside the supported number range.')
  }
  return Object.is(value, -0) ? 0 : Number(value.toPrecision(15))
}

function factorial(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 170) {
    throw new Error('Factorial requires a whole number from 0 to 170.')
  }
  let result = 1
  for (let factor = 2; factor <= value; factor += 1) result *= factor
  return result
}

function applyFunction(
  name: string,
  args: number[],
  angleMode: AngleMode,
): number {
  const unary = () => {
    if (args.length !== 1) throw new Error(`${name} expects one value.`)
    return args[0]
  }
  const argument = unary()
  const toRadians = (value: number) =>
    angleMode === 'degrees' ? (value * Math.PI) / 180 : value
  const fromRadians = (value: number) =>
    angleMode === 'degrees' ? (value * 180) / Math.PI : value

  switch (name) {
    case 'sqrt':
      if (argument < 0) throw new Error('Square root requires a value of 0 or more.')
      return Math.sqrt(argument)
    case 'cbrt':
      return Math.cbrt(argument)
    case 'abs':
      return Math.abs(argument)
    case 'factorial':
      return factorial(argument)
    case 'ln':
      if (argument <= 0) throw new Error('Natural logarithm requires a value greater than 0.')
      return Math.log(argument)
    case 'log':
    case 'log10':
      if (argument <= 0) throw new Error('Base-10 logarithm requires a value greater than 0.')
      return Math.log10(argument)
    case 'exp':
      if (argument < 0 && Math.exp(argument) === 0) {
        throw new Error('The result is too small to represent accurately.')
      }
      return Math.exp(argument)
    case 'sin':
      return Math.sin(toRadians(argument))
    case 'cos':
      return Math.cos(toRadians(argument))
    case 'tan': {
      const radians = toRadians(argument)
      if (Math.abs(Math.cos(radians)) < 1e-14) {
        throw new Error('Tangent is undefined at this angle.')
      }
      return Math.tan(radians)
    }
    case 'asin':
      if (argument < -1 || argument > 1) {
        throw new Error('Inverse sine requires a value between -1 and 1.')
      }
      return fromRadians(Math.asin(argument))
    case 'acos':
      if (argument < -1 || argument > 1) {
        throw new Error('Inverse cosine requires a value between -1 and 1.')
      }
      return fromRadians(Math.acos(argument))
    case 'atan':
      return fromRadians(Math.atan(argument))
    default:
      throw new Error(`Unsupported function "${name}".`)
  }
}

function applyRoot(args: number[]): number {
  if (args.length !== 2) {
    throw new Error('Nth root syntax is root(value, degree).')
  }
  const [value, degree] = args
  if (!Number.isFinite(degree) || degree === 0) {
    throw new Error('Root degree must be a non-zero real number.')
  }
  if (
    value < 0 &&
    (!Number.isInteger(degree) || Math.abs(degree % 2) !== 1)
  ) {
    throw new Error('Negative radicands require an odd integer root degree.')
  }
  if (value === 0 && degree < 0) {
    throw new Error('Zero does not have a negative-degree root.')
  }
  const root = Math.pow(Math.abs(value), 1 / Math.abs(degree))
  const signedRoot = value < 0 ? -root : root
  return degree < 0 ? 1 / signedRoot : signedRoot
}

function tokenize(source: string): Token[] {
  const normalized = source.replace(/[×·]/g, '*').replace(/÷/g, '/')
  const tokens: Token[] = []
  let index = 0

  while (index < normalized.length) {
    const char = normalized[index]
    if (/\s/.test(char)) {
      index += 1
      continue
    }

    const numberMatch = normalized.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i)
    if (numberMatch) {
      const value = Number(numberMatch[0])
      if (!Number.isFinite(value)) throw new Error('Enter a finite number.')
      tokens.push({ type: 'number', value })
      index += numberMatch[0].length
      continue
    }

    const identifierMatch = normalized.slice(index).match(/^[a-zA-Z_][a-zA-Z_0-9]*/)
    if (identifierMatch) {
      tokens.push({ type: 'identifier', value: identifierMatch[0].toLowerCase() })
      index += identifierMatch[0].length
      continue
    }

    if ('+-*/^!'.includes(char)) {
      tokens.push({
        type: 'operator',
        value: char as '+' | '-' | '*' | '/' | '^' | '!',
      })
    } else if (char === '(') {
      tokens.push({ type: 'leftParen' })
    } else if (char === ')') {
      tokens.push({ type: 'rightParen' })
    } else if (char === ',') {
      tokens.push({ type: 'comma' })
    } else {
      throw new Error(`Unsupported character "${char}".`)
    }
    index += 1
  }

  const expanded: Token[] = []
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    const next = tokens[index + 1]
    const previous = expanded[expanded.length - 1]
    const endsValue =
      previous?.type === 'number' ||
      previous?.type === 'rightParen' ||
      (previous?.type === 'operator' && previous.value === '!') ||
      (previous?.type === 'identifier' &&
        ['x', 'pi', 'e'].includes(previous.value))
    const startsValue =
      token.type === 'number' ||
      token.type === 'leftParen' ||
      token.type === 'identifier'
    if (
      endsValue &&
      startsValue &&
      !(previous?.type === 'number' && token.type === 'number')
    ) {
      expanded.push({ type: 'operator', value: '*' })
    } else if (
      previous?.type === 'identifier' &&
      (previous.value === 'x' ||
        previous.value === 'pi' ||
        previous.value === 'e') &&
      token.type === 'leftParen'
    ) {
      expanded.push({ type: 'operator', value: '*' })
    } else if (
      previous?.type === 'rightParen' &&
      token.type === 'identifier' &&
      functions.has(token.value) &&
      next?.type === 'leftParen'
    ) {
      expanded.push({ type: 'operator', value: '*' })
    }
    expanded.push(token)
  }
  return expanded
}

class Parser {
  private position = 0
  private readonly tokens: Token[]
  private readonly angleMode: AngleMode
  private readonly variable: number | undefined

  constructor(
    tokens: Token[],
    angleMode: AngleMode,
    variable: number | undefined,
  ) {
    this.tokens = tokens
    this.angleMode = angleMode
    this.variable = variable
  }

  parse(): number {
    if (this.tokens.length === 0) throw new Error('Enter a mathematical expression.')
    const result = this.parseExpression(0)
    if (this.position !== this.tokens.length) {
      throw new Error('Check the expression for missing operators or parentheses.')
    }
    return finite(result)
  }

  private peek(): Token | undefined {
    return this.tokens[this.position]
  }

  private consume(): Token {
    const token = this.tokens[this.position]
    if (!token) throw new Error('The expression is incomplete.')
    this.position += 1
    return token
  }

  private parseExpression(minPrecedence: number): number {
    let left = this.parsePrefix()

    while (true) {
      const token = this.peek()
      if (token?.type !== 'operator') break

      if (token.value === '!') {
        if (5 < minPrecedence) break
        this.consume()
        left = factorial(left)
        continue
      }

      const precedence =
        token.value === '+' || token.value === '-'
          ? 1
          : token.value === '*' || token.value === '/'
            ? 2
            : 4
      if (precedence < minPrecedence) break
      this.consume()
      const right = this.parseExpression(
        token.value === '^' ? precedence : precedence + 1,
      )
      if (token.value === '+') left += right
      else if (token.value === '-') left -= right
      else if (token.value === '*') {
        const previous = left
        left *= right
        if (previous !== 0 && right !== 0 && left === 0) {
          throw new Error('The result is too small to represent accurately.')
        }
      }
      else if (token.value === '/') {
        if (right === 0) throw new Error('Cannot divide by zero.')
        const previous = left
        left /= right
        if (previous !== 0 && left === 0) {
          throw new Error('The result is too small to represent accurately.')
        }
      } else {
        const base = left
        if (base === 0 && right === 0) {
          throw new Error('Zero raised to the zero power is undefined.')
        }
        if (base < 0 && !Number.isInteger(right)) {
          throw new Error('A negative base requires an integer exponent for a real result.')
        }
        left = Math.pow(left, right)
        if (base !== 0 && left === 0) {
          throw new Error('The result is too small to represent accurately.')
        }
      }
      if (!Number.isFinite(left)) {
        throw new Error('The result is outside the supported number range.')
      }
    }
    return left
  }

  private parsePrefix(): number {
    const token = this.consume()
    if (token.type === 'number') return token.value
    if (token.type === 'operator' && (token.value === '+' || token.value === '-')) {
      const value = this.parseExpression(3)
      return token.value === '-' ? -value : value
    }
    if (token.type === 'leftParen') {
      const value = this.parseExpression(0)
      if (this.consume().type !== 'rightParen') {
        throw new Error('Check the expression for matching parentheses.')
      }
      return value
    }
    if (token.type === 'identifier') return this.parseIdentifier(token.value)
    throw new Error('The expression is incomplete.')
  }

  private parseIdentifier(name: string): number {
    if (name === 'pi') return Math.PI
    if (name === 'e') return Math.E
    if (name === 'x') {
      if (this.variable === undefined) {
        throw new Error('The variable x is only available in Function Mode.')
      }
      return this.variable
    }
    if (!functions.has(name) && name !== 'root') {
      throw new Error(`Unsupported name "${name}".`)
    }
    if (this.consume().type !== 'leftParen') {
      throw new Error(`${name} must be followed by parentheses.`)
    }
    const args: number[] = []
    if (this.peek()?.type !== 'rightParen') {
      args.push(this.parseExpression(0))
      while (this.peek()?.type === 'comma') {
        this.consume()
        args.push(this.parseExpression(0))
      }
    }
    if (this.consume().type !== 'rightParen') {
      throw new Error(`Check the parentheses in ${name}(...).`)
    }
    return name === 'root' ? applyRoot(args) : applyFunction(name, args, this.angleMode)
  }
}

export function evaluateExpression(
  expression: string,
  options: { angleMode?: AngleMode; variable?: number } = {},
): number {
  if (expression.length > 512) {
    throw new Error('Expressions must be 512 characters or fewer.')
  }
  if (options.variable !== undefined && !Number.isFinite(options.variable)) {
    throw new Error('The value of x must be finite.')
  }
  const source = expression.trim().replace(/^f\s*\(\s*x\s*\)\s*=\s*/i, '')
  return new Parser(
    tokenize(source),
    options.angleMode ?? 'degrees',
    options.variable,
  ).parse()
}
