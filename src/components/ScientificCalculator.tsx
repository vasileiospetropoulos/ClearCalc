import { useEffect, useRef, useState } from 'react'
import { evaluateExpression, type AngleMode } from '../utils/mathEngine'
import { formatNumber } from '../utils/formatNumber'

type ScientificCalculatorProps = {
  angleMode: AngleMode
  onAngleModeChange: (mode: AngleMode) => void
  onCalculation: (expression: string, result: number) => void
}

function ScientificCalculator({
  angleMode,
  onAngleModeChange,
  onCalculation,
}: ScientificCalculatorProps) {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [degree, setDegree] = useState('3')
  const inputRef = useRef<HTMLInputElement>(null)

  const calculate = (value = expression) => {
    try {
      const calculated = evaluateExpression(value, { angleMode })
      setResult(calculated)
      setError(null)
      onCalculation(value, calculated)
    } catch (caught) {
      setResult(null)
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to evaluate this expression.',
      )
    }
  }

  const updateExpression = (update: (current: string) => string) => {
    setExpression((current) => update(current))
    setError(null)
    setResult(null)
  }

  const appendInput = (value: string) => {
    updateExpression((current) => {
      if (value === '.') {
        const currentNumber = current.split(/[+\-*/^(),]/).at(-1) ?? ''
        if (currentNumber.includes('.')) return current
        return current + (currentNumber === '' ? '0.' : '.')
      }
      return current + value
    })
  }

  const apply = (operation: string, suffix = '') => {
    const value = expression.trim() || '0'
    if (operation === 'constant') {
      appendInput(suffix)
      return
    }
    if (operation === 'nthRoot' && !expression.trim()) {
      updateExpression(() => 'root(')
      return
    }
    if (operation === 'reciprocal' && !expression.trim()) {
      updateExpression(() => '1/(')
      return
    }
    if (operation === 'factorial' && !expression.trim()) {
      updateExpression(() => 'factorial(')
      return
    }
    if (['sqrt', 'cbrt', 'abs', 'ln', 'log', 'exp', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(operation) && !expression.trim()) {
      updateExpression(() => `${operation}(`)
      return
    }
    const next =
      operation === 'square'
        ? `(${value})^2`
        : operation === 'cube'
          ? `(${value})^3`
          : operation === 'reciprocal'
            ? `1/(${value})`
            : operation === 'factorial'
              ? `(${value})!`
              : operation === 'nthRoot'
                ? `root(${value},${degree})`
                : `${operation}(${value})`
    setExpression(next)
    calculate(next)
  }

  const actions = [
    { label: 'Square root', text: '√x', action: 'sqrt' },
    { label: 'Cube root', text: '∛x', action: 'cbrt' },
    { label: 'Nth root', text: 'ⁿ√x', action: 'nthRoot' },
    { label: 'Square', text: 'x²', action: 'square' },
    { label: 'Cube', text: 'x³', action: 'cube' },
    { label: 'Reciprocal', text: '1/x', action: 'reciprocal' },
    { label: 'Absolute value', text: '|x|', action: 'abs' },
    { label: 'Factorial', text: 'n!', action: 'factorial' },
    { label: 'Natural logarithm', text: 'ln', action: 'ln' },
    { label: 'Base-10 logarithm', text: 'log₁₀', action: 'log' },
    { label: 'Exponential', text: 'eˣ', action: 'exp' },
    { label: 'Sine', text: 'sin', action: 'sin' },
    { label: 'Cosine', text: 'cos', action: 'cos' },
    { label: 'Tangent', text: 'tan', action: 'tan' },
    { label: 'Inverse sine', text: 'asin', action: 'asin' },
    { label: 'Inverse cosine', text: 'acos', action: 'acos' },
    { label: 'Inverse tangent', text: 'atan', action: 'atan' },
  ]

  const keypad = [
    { label: 'All clear', text: 'AC', action: 'clear', kind: 'utility' },
    { label: 'Clear entry', text: 'CE', action: 'clearEntry', kind: 'utility' },
    { label: 'Backspace', text: '⌫', action: 'backspace', kind: 'utility' },
    { label: 'Open parenthesis', text: '(', action: '(', kind: 'operator' },
    { label: 'Close parenthesis', text: ')', action: ')', kind: 'operator' },
    { label: '7', text: '7', action: '7', kind: 'number' },
    { label: '8', text: '8', action: '8', kind: 'number' },
    { label: '9', text: '9', action: '9', kind: 'number' },
    { label: 'Divide', text: '÷', action: '/', kind: 'operator' },
    { label: 'Multiply', text: '×', action: '*', kind: 'operator' },
    { label: '4', text: '4', action: '4', kind: 'number' },
    { label: '5', text: '5', action: '5', kind: 'number' },
    { label: '6', text: '6', action: '6', kind: 'number' },
    { label: 'Subtract', text: '−', action: '-', kind: 'operator' },
    { label: 'Add', text: '+', action: '+', kind: 'operator' },
    { label: '1', text: '1', action: '1', kind: 'number' },
    { label: '2', text: '2', action: '2', kind: 'number' },
    { label: '3', text: '3', action: '3', kind: 'number' },
    { label: 'Decimal point', text: '.', action: '.', kind: 'number' },
    { label: 'Equals', text: '=', action: 'equals', kind: 'equals' },
    { label: '0', text: '0', action: '0', kind: 'number' },
    { label: 'Insert π', text: 'π', action: 'pi', kind: 'constant' },
    { label: 'Insert e', text: 'e', action: 'e', kind: 'constant' },
    { label: 'Comma', text: ',', action: ',', kind: 'operator' },
    { label: 'Exponent', text: 'xʸ', action: '^', kind: 'operator' },
  ]

  const keypadAction = (action: string) => {
    if (action === 'clear') {
      setExpression('')
      setResult(null)
      setError(null)
    } else if (action === 'clearEntry') {
      updateExpression((current) => {
        const splitAt = Math.max(
          current.lastIndexOf('+'),
          current.lastIndexOf('-'),
          current.lastIndexOf('*'),
          current.lastIndexOf('/'),
          current.lastIndexOf('^'),
          current.lastIndexOf('('),
          current.lastIndexOf(','),
        )
        return current.slice(0, splitAt + 1)
      })
    } else if (action === 'backspace') {
      updateExpression((current) => current.slice(0, -1))
    } else if (action === 'equals') {
      calculate()
    } else {
      appendInput(action)
    }
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      ) {
        return
      }

      if (/^[0-9]$/.test(event.key)) keypadAction(event.key)
      else if (event.key === '.') keypadAction('.')
      else if (event.key === ',') keypadAction(',')
      else if (event.key === '+') keypadAction('+')
      else if (event.key === '-') keypadAction('-')
      else if (event.key === '*') keypadAction('*')
      else if (event.key === '/') keypadAction('/')
      else if (event.key === '^') keypadAction('^')
      else if (event.key === '(' || event.key === ')') keypadAction(event.key)
      else if (event.key === 'Backspace' || event.key === 'Delete') {
        keypadAction('backspace')
      } else if (event.key === 'Escape') keypadAction('clear')
      else if (event.key === 'Enter' || event.key === '=') {
        keypadAction('equals')
      } else return

      event.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <section className="mode-card scientific-card" aria-labelledby="scientific-title">
      <div className="mode-heading">
        <div>
          <h1 id="scientific-title">Scientific</h1>
        </div>
        <fieldset className="angle-toggle">
          <legend>Trigonometry angle unit</legend>
          {(['degrees', 'radians'] as const).map((unit) => (
            <button
              key={unit}
              type="button"
              aria-pressed={angleMode === unit}
              onClick={() => onAngleModeChange(unit)}
            >
              {unit === 'degrees' ? 'DEG' : 'RAD'}
            </button>
          ))}
        </fieldset>
      </div>

      <label className="field-label" htmlFor="scientific-expression">
        Expression
      </label>
      <div className="expression-entry">
        <input
          id="scientific-expression"
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Try sqrt(9), 2^3, or sin(90)"
          value={expression}
          onChange={(event) => {
            setExpression(event.target.value)
            setError(null)
            setResult(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') calculate()
          }}
        />
        <button type="button" className="primary-action" onClick={() => calculate()}>
          Calculate
        </button>
      </div>

      <div className="scientific-controls">
        <label className="degree-entry" htmlFor="root-degree">
          Root / power index
          <input
            id="root-degree"
            type="number"
            min="-170"
            max="170"
            step="any"
            value={degree}
            onChange={(event) => setDegree(event.target.value)}
          />
        </label>
        <div className="constant-controls" aria-label="Mathematical constants">
          <button type="button" onClick={() => apply('constant', 'pi')}>
            Insert π
          </button>
          <button type="button" onClick={() => apply('constant', 'e')}>
            Insert e
          </button>
        </div>
      </div>

      <div className="science-grid" role="group" aria-label="Scientific operations">
        {actions.map((item) => (
          <button
            key={item.action}
            type="button"
            aria-label={item.label}
            onClick={() => {
              apply(item.action)
              window.requestAnimationFrame(() => inputRef.current?.focus())
            }}
          >
            {item.text}
          </button>
        ))}
        <button
          type="button"
          aria-label="General exponentiation"
          onClick={() => {
            appendInput('^')
            window.requestAnimationFrame(() => inputRef.current?.focus())
          }}
        >
          xʸ
        </button>
      </div>

      <div className="scientific-keypad" role="group" aria-label="Scientific numeric keypad">
        {keypad.map((key) => (
          <button
            key={key.label}
            type="button"
            className={`scientific-key scientific-key--${key.kind}${key.action === '0' ? ' scientific-key--zero' : ''}`}
            aria-label={key.label}
            onClick={() => keypadAction(key.action)}
          >
            {key.text}
          </button>
        ))}
      </div>

      <div className={`mode-result${error ? ' mode-result--error' : ''}`} aria-live="polite">
        <span>{error ? 'Check your expression' : 'Result'}</span>
        <output>{error ?? (result === null ? 'Enter an expression to begin' : formatNumber(result))}</output>
      </div>
      <p className="mode-note">
        Use <code>root(value, degree)</code> for real-valued nth roots.
        Trigonometry follows the selected angle unit.
      </p>
    </section>
  )
}

export default ScientificCalculator
