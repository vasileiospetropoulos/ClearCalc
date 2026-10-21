import { useState } from 'react'
import { evaluateExpression, type AngleMode } from '../utils/mathEngine'
import { formatNumber } from '../utils/formatNumber'
import ExampleFunctionSelect, {
  type FunctionExample,
} from './ExampleFunctionSelect'

type FunctionCalculatorProps = {
  angleMode: AngleMode
  onAngleModeChange: (mode: AngleMode) => void
  onCalculation: (expression: string, result: number) => void
}

const examples: FunctionExample[] = [
  { label: 'Quadratic', expression: 'f(x) = x^2 + 3x + 2', x: '2' },
  { label: 'Linear', expression: 'f(x) = 2x + 1', x: '3' },
  { label: 'Sine', expression: 'f(x) = sin(x)', x: '90' },
  { label: 'Rational', expression: 'f(x) = (x + 1) / (x - 2)', x: '2' },
]

function FunctionCalculator({
  angleMode,
  onAngleModeChange,
  onCalculation,
}: FunctionCalculatorProps) {
  const [functionDefinition, setFunctionDefinition] = useState(examples[0].expression)
  const [inputValue, setInputValue] = useState(examples[0].x)
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [evaluatedAt, setEvaluatedAt] = useState<string | null>(null)

  const calculate = () => {
    const x = Number(inputValue)
    if (inputValue.trim() === '' || !Number.isFinite(x)) {
      setResult(null)
      setError('Enter a valid finite value for x.')
      return
    }
    try {
      const value = evaluateExpression(functionDefinition, {
        angleMode,
        variable: x,
      })
      setResult(value)
      setEvaluatedAt(inputValue)
      setError(null)
      onCalculation(
        `f(${inputValue}) = ${functionDefinition.trim().replace(/^f\s*\(\s*x\s*\)\s*=\s*/i, '')}`,
        value,
      )
    } catch (caught) {
      setResult(null)
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to evaluate this function.',
      )
    }
  }

  return (
    <section className="mode-card function-card" aria-labelledby="function-title">
      <div className="mode-heading">
        <div>
          <h1 id="function-title">Function mode</h1>
        </div>
        <span className="function-mark">f(x)</span>
      </div>
      <fieldset className="angle-toggle function-angle-toggle">
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

      <label className="field-label" id="function-example-label" htmlFor="function-example">
        Start with an example
      </label>
      <ExampleFunctionSelect
        examples={examples}
        onSelect={(example) => {
          setFunctionDefinition(example.expression)
          setInputValue(example.x)
          setResult(null)
          setError(null)
          setEvaluatedAt(null)
        }}
      />

      <label className="field-label" htmlFor="function-definition">
        Function definition
      </label>
      <input
        id="function-definition"
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={functionDefinition}
        onChange={(event) => {
          setFunctionDefinition(event.target.value)
          setError(null)
          setResult(null)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') calculate()
        }}
      />
      <p className="field-hint">
        Enter an expression in x; implicit multiplication is supported (for
        example, <code>3x</code>).
      </p>

      <div className="function-evaluate-row">
        <label className="field-label" htmlFor="function-x">
          Value of x
        </label>
        <input
          id="function-x"
          type="number"
          step="any"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)
            setError(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') calculate()
          }}
        />
        <button type="button" className="primary-action" onClick={calculate}>
          Evaluate
        </button>
      </div>

      <div className={`mode-result${error ? ' mode-result--error' : ''}`} aria-live="polite">
        <span>{error ? 'Unable to evaluate' : 'Function result'}</span>
        <output>
          {error ??
            (result === null
              ? 'Define a function and choose a value for x'
              : `f(${evaluatedAt}) = ${formatNumber(result)}`)}
        </output>
      </div>
      <p className="mode-note">
        Supports arithmetic, parentheses, constants, powers, roots, logarithms,
        and trigonometric functions.
      </p>
    </section>
  )
}

export default FunctionCalculator
