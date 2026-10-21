import { useEffect, useRef, useState } from 'react'
import CalculatorButton from './CalculatorButton'
import CalculationHistory, { type HistoryEntry } from './CalculationHistory'
import CalculatorDisplay from './CalculatorDisplay'
import ScientificCalculator from './ScientificCalculator'
import FunctionCalculator from './FunctionCalculator'
import type { AngleMode } from '../utils/mathEngine'
import {
  applyPercent,
  evaluateTokens,
  formatExpressionToken,
  type CalculatorToken,
  type Operator,
} from '../utils/calculatorEngine'
import { formatNumber } from '../utils/formatNumber'
import './Calculator.css'

type RepeatOperation = { operator: Operator; operand: number }
type CalculatorMode = 'standard' | 'scientific' | 'function'
const modeOrder = ['standard', 'scientific', 'function'] as const

function Calculator() {
  const [mode, setMode] = useState<CalculatorMode>('standard')
  const [angleMode, setAngleMode] = useState<AngleMode>('degrees')
  const [tokens, setTokens] = useState<CalculatorToken[]>([])
  const [entry, setEntry] = useState('0')
  const [entryActive, setEntryActive] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [expression, setExpression] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [percentLabel, setPercentLabel] = useState<string | null>(null)
  const [repeatOperation, setRepeatOperation] = useState<RepeatOperation | null>(
    null,
  )
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const historyId = useRef(0)

  const addHistoryEntry = (calculation: string, value: number) => {
    setHistory((current) =>
      [
        { id: ++historyId.current, expression: calculation, result: value },
        ...current,
      ].slice(0, 10),
    )
  }

  const numericValue = (value: string) => Number(value)
  const pendingOperator = (): Operator | undefined => {
    const last = tokens[tokens.length - 1]
    return typeof last === 'string' ? last : undefined
  }

  const expressionForCurrentEntry = () => {
    const base = tokens.map(formatExpressionToken).join(' ')
    const shownEntry = percentLabel ? `${percentLabel}%` : entry
    return [base, ...(entryActive ? [shownEntry] : [])].filter(Boolean).join(' ')
  }

  const enterDigit = (digit: string) => {
    if (error) {
      setTokens([])
      setEntry(digit)
      setEntryActive(false)
      setResult(null)
      setExpression('')
      setPercentLabel(null)
      setRepeatOperation(null)
      setError(null)
      setEntryActive(true)
      return
    }
    if (result !== null) {
      setTokens([])
      setExpression('')
      setResult(null)
      setRepeatOperation(null)
      setEntry(digit)
      setEntryActive(true)
      setPercentLabel(null)
      return
    }
    setEntry((current) => {
      if (!entryActive || current === '0') return digit
      if (current === '-0') return `-${digit}`
      return current + digit
    })
    setEntryActive(true)
    setPercentLabel(null)
    setRepeatOperation(null)
  }

  const enterDecimal = () => {
    if (error) {
      setTokens([])
      setEntry('0.')
      setEntryActive(true)
      setResult(null)
      setExpression('')
      setPercentLabel(null)
      setRepeatOperation(null)
      setError(null)
      return
    }
    if (result !== null) {
      setTokens([])
      setExpression('')
      setResult(null)
      setRepeatOperation(null)
      setEntry('0.')
      setEntryActive(true)
      setPercentLabel(null)
      return
    }
    setEntry((current) => {
      if (!entryActive) return '0.'
      return current.includes('.') ? current : `${current}.`
    })
    setEntryActive(true)
    setPercentLabel(null)
    setRepeatOperation(null)
  }

  const chooseOperator = (operator: Operator) => {
    if (error) return
    if (result !== null) {
      setTokens([result, operator])
      setExpression(formatNumber(result))
      setResult(null)
      setEntryActive(false)
      setPercentLabel(null)
      setRepeatOperation(null)
      return
    }

    const nextTokens = [...tokens]
    if (entryActive) {
      nextTokens.push(numericValue(entry))
    } else if (nextTokens.length === 0) {
      nextTokens.push(numericValue(entry))
    }
    if (typeof nextTokens[nextTokens.length - 1] === 'string') {
      nextTokens[nextTokens.length - 1] = operator
    } else {
      nextTokens.push(operator)
    }
    setTokens(nextTokens)
    setEntryActive(false)
    setPercentLabel(null)
    setRepeatOperation(null)
  }

  const pressPercent = () => {
    if (error || result !== null) return
    const rawEntry = entryActive ? entry : '0'
    const precedingToken =
      pendingOperator() === undefined
        ? tokens[tokens.length - 1]
        : tokens[tokens.length - 2]
    const priorOperand =
      typeof precedingToken === 'number' ? precedingToken : undefined
    try {
      const percentValue = applyPercent(
        numericValue(rawEntry),
        priorOperand,
        pendingOperator(),
      )
      setPercentLabel(rawEntry)
      setEntry(String(percentValue))
      setEntryActive(true)
      setRepeatOperation(null)
    } catch {
      setError('Unable to calculate this percentage.')
    }
  }

  const calculate = () => {
    if (error) return

    if (result !== null && repeatOperation) {
      try {
        const repeated = evaluateTokens([
          result,
          repeatOperation.operator,
          repeatOperation.operand,
        ])
        const repeatedExpression = `${formatNumber(result)} ${repeatOperation.operator} ${formatNumber(repeatOperation.operand)}`
        setExpression(repeatedExpression)
        setEntry(String(repeated))
        setResult(repeated)
        addHistoryEntry(repeatedExpression, repeated)
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : 'Unable to calculate.',
        )
      }
      return
    }

    const completeTokens = [...tokens]
    if (entryActive) completeTokens.push(numericValue(entry))
    if (completeTokens.length === 0) return
    if (typeof completeTokens[completeTokens.length - 1] === 'string') {
      setError('Enter a number to complete the calculation.')
      return
    }

    const shownExpression = expressionForCurrentEntry()
    try {
      const calculated = evaluateTokens(completeTokens)
      const lastOperator = [...completeTokens]
        .reverse()
        .find((token): token is Operator => typeof token === 'string')
      const lastNumber = completeTokens[completeTokens.length - 1]
      setExpression(shownExpression || formatNumber(calculated))
      setEntry(String(calculated))
      setResult(calculated)
      setTokens([])
      setEntryActive(false)
      setPercentLabel(null)
      setRepeatOperation(
        lastOperator && typeof lastNumber === 'number'
          ? { operator: lastOperator, operand: lastNumber }
          : null,
      )
      addHistoryEntry(shownExpression || formatNumber(calculated), calculated)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to calculate.')
    }
  }

  const clearAll = () => {
    setTokens([])
    setEntry('0')
    setEntryActive(false)
    setResult(null)
    setExpression('')
    setError(null)
    setPercentLabel(null)
    setRepeatOperation(null)
  }

  const clearEntry = () => {
    if (error) {
      clearAll()
      return
    }
    if (result !== null) {
      setTokens([])
      setExpression('')
      setResult(null)
      setRepeatOperation(null)
    }
    setEntry('0')
    setEntryActive(true)
    setPercentLabel(null)
  }

  const backspace = () => {
    if (error) {
      clearAll()
      return
    }
    if (result !== null) {
      setTokens([])
      setExpression('')
      setResult(null)
      setRepeatOperation(null)
      setEntry('0')
      setEntryActive(true)
      return
    }
    if (!entryActive) return
    setEntry((current) => {
      const shortened = current.slice(0, -1)
      return shortened === '' || shortened === '-' ? '0' : shortened
    })
    setPercentLabel(null)
    setRepeatOperation(null)
  }

  const toggleSign = () => {
    if (error) return
    if (result !== null) {
      setEntry((current) => String(-numericValue(current)))
      setResult((current) => (current === null ? null : -current))
      setExpression('')
      setRepeatOperation(null)
      return
    }
    if (!entryActive) {
      setEntry('-0')
      setEntryActive(true)
      setPercentLabel(null)
      setRepeatOperation(null)
      return
    }
    setEntry((current) => {
      const value = numericValue(current)
      if (value === 0) return current.startsWith('-') ? '0' : '-0'
      return current.startsWith('-') ? current.slice(1) : `-${current}`
    })
    setEntryActive(true)
    setPercentLabel(null)
  }

  const useHistoryResult = (value: number) => {
    setMode('standard')
    setTokens([])
    setEntry(String(value))
    setEntryActive(false)
    setResult(value)
    setExpression('')
    setError(null)
    setPercentLabel(null)
    setRepeatOperation(null)
    setHistoryOpen(false)
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
      if (mode !== 'standard') return

      const digit = /^[0-9]$/.test(event.key)
      if (digit) enterDigit(event.key)
      else if (event.key === '.' || event.key === ',') enterDecimal()
      else if (event.key === '+' || event.key === '-') {
        chooseOperator(event.key)
      } else if (event.key === '*') chooseOperator('×')
      else if (event.key === '/') chooseOperator('÷')
      else if (event.key === '%') pressPercent()
      else if (event.key === 'Enter' || event.key === '=') calculate()
      else if (event.key === 'Backspace' || event.key === 'Delete') backspace()
      else if (event.key === 'Escape') clearAll()
      else return

      event.preventDefault()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const currentValue = error
    ? 'Error'
    : result !== null
      ? formatNumber(result)
      : entry
  const historyPanel = historyOpen ? (
    <div id="calculation-history">
      <CalculationHistory
        entries={history}
        onSelect={useHistoryResult}
        onClear={() => setHistory([])}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  ) : null

  return (
    <main className="app-shell">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <header className="app-header">
        <a className="brand" href="/" aria-label="ClearCalc home">
          <span className="brand__mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>clear<span>calc</span></span>
        </a>
        <button
          className={`history-toggle${historyOpen ? ' history-toggle--active' : ''}`}
          type="button"
          aria-expanded={historyOpen}
          aria-controls={historyOpen ? 'calculation-history' : undefined}
          onClick={() => setHistoryOpen((open) => !open)}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3.4 8.1a6.7 6.7 0 1 1-.1 3.8M3 4.7v3.8h3.8M10 6.1v4.2l2.8 1.7" />
          </svg>
          History <span>{history.length}</span>
        </button>
      </header>

      <nav className="mode-tabs" role="tablist" aria-label="Calculator mode">
        {(
          [
            ['standard', 'Standard'],
            ['scientific', 'Scientific'],
            ['function', 'Function'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            id={`${value}-mode-tab`}
            type="button"
            role="tab"
            aria-selected={mode === value}
            aria-controls={mode === value ? `${value}-mode-panel` : undefined}
            className={mode === value ? 'mode-tab mode-tab--active' : 'mode-tab'}
            onClick={() => setMode(value)}
            onKeyDown={(event) => {
              if (
                !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
              ) {
                return
              }
              event.preventDefault()
              const tabs = Array.from(
                event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                  '[role="tab"]',
                ) ?? [],
              )
              const currentIndex = tabs.indexOf(event.currentTarget)
              const nextIndex =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? tabs.length - 1
                    : (currentIndex +
                        (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) %
                      tabs.length
              const nextMode = modeOrder[nextIndex]
              if (nextMode) setMode(nextMode)
              tabs[nextIndex]?.focus()
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      <section
        id="standard-mode-panel"
        className={`calculator-layout${mode !== 'standard' ? ' calculator-layout--hidden' : ''}`}
        role="tabpanel"
        aria-labelledby="standard-mode-tab"
        aria-label="ClearCalc calculator"
      >
        <div className="calculator-card">
          <div className="card-heading">
            <div>
              <h1>Calculator</h1>
            </div>
            <span
              className={`status-indicator${error ? ' status-indicator--error' : ''}`}
              aria-label={error ? 'Calculation error' : 'Ready'}
            >
              <span /> {error ? 'Check input' : 'Ready'}
            </span>
          </div>

          <CalculatorDisplay
            expression={
              error ?? (result !== null ? expression : expressionForCurrentEntry())
            }
            value={currentValue}
            isError={Boolean(error)}
          />

          <div className="keypad" role="group" aria-label="Calculator keypad">
            <CalculatorButton label="All clear" kind="utility" onClick={clearAll}>
              AC
            </CalculatorButton>
            <CalculatorButton label="Clear entry" kind="utility" onClick={clearEntry}>
              CE
            </CalculatorButton>
            <CalculatorButton label="Backspace" kind="utility" onClick={backspace}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5H20v14H9l-6-7 6-7Zm3.2 4.2 5.6 5.6m0-5.6-5.6 5.6" />
              </svg>
            </CalculatorButton>
            <CalculatorButton label="Percent" kind="utility" onClick={pressPercent}>
              %
            </CalculatorButton>
            {(['7', '8', '9'] as const).map((digit) => (
              <CalculatorButton key={digit} label={digit} onClick={() => enterDigit(digit)}>
                {digit}
              </CalculatorButton>
            ))}
            <CalculatorButton label="Divide" kind="operator" onClick={() => chooseOperator('÷')}>
              ÷
            </CalculatorButton>
            {(['4', '5', '6'] as const).map((digit) => (
              <CalculatorButton key={digit} label={digit} onClick={() => enterDigit(digit)}>
                {digit}
              </CalculatorButton>
            ))}
            <CalculatorButton label="Multiply" kind="operator" onClick={() => chooseOperator('×')}>
              ×
            </CalculatorButton>

            {(['1', '2', '3'] as const).map((digit) => (
              <CalculatorButton key={digit} label={digit} onClick={() => enterDigit(digit)}>
                {digit}
              </CalculatorButton>
            ))}
            <CalculatorButton label="Subtract" kind="operator" onClick={() => chooseOperator('-')}>
              −
            </CalculatorButton>

            <CalculatorButton label="Change sign" kind="utility" onClick={toggleSign}>
              +/−
            </CalculatorButton>
            <CalculatorButton label="0" onClick={() => enterDigit('0')}>
              0
            </CalculatorButton>
            <CalculatorButton label="Decimal point" onClick={enterDecimal}>
              .
            </CalculatorButton>
            <CalculatorButton label="Add" kind="operator" onClick={() => chooseOperator('+')}>
              +
            </CalculatorButton>
            <CalculatorButton label="Equals" kind="equals" onClick={calculate}>
              =
            </CalculatorButton>
          </div>

        </div>

        {mode === 'standard' && historyPanel}
      </section>
      {mode === 'scientific' && (
        <section
          id="scientific-mode-panel"
          className="calculator-layout mode-layout"
          role="tabpanel"
          aria-labelledby="scientific-mode-tab"
        >
          <ScientificCalculator
            angleMode={angleMode}
            onAngleModeChange={setAngleMode}
            onCalculation={addHistoryEntry}
          />
          {historyPanel}
        </section>
      )}
      {mode === 'function' && (
        <section
          id="function-mode-panel"
          className="calculator-layout mode-layout"
          role="tabpanel"
          aria-labelledby="function-mode-tab"
        >
          <FunctionCalculator
            angleMode={angleMode}
            onAngleModeChange={setAngleMode}
            onCalculation={addHistoryEntry}
          />
          {historyPanel}
        </section>
      )}
    </main>
  )
}

export default Calculator
