import { useState } from 'react'
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

  const apply = (operation: string, suffix = '') => {
    const value = expression.trim() || '0'
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
                : operation === 'constant'
                  ? expression.trim()
                    ? `(${expression.trim()})*${suffix}`
                    : suffix
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
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Try sqrt(9), 2^3, or sin(90)"
          value={expression}
          onChange={(event) => {
            setExpression(event.target.value)
            setError(null)
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
            onClick={() => apply(item.action)}
          >
            {item.text}
          </button>
        ))}
        <button
          type="button"
          aria-label="General exponentiation"
          onClick={() => {
            const value = expression.trim() || '0'
            const next = `(${value})^${degree}`
            setExpression(next)
            calculate(next)
          }}
        >
          xʸ
        </button>
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
