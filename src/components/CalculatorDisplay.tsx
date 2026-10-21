type CalculatorDisplayProps = {
  expression: string
  value: string
  isError: boolean
}

function CalculatorDisplay({
  expression,
  value,
  isError,
}: CalculatorDisplayProps) {
  return (
    <section className="display" aria-label="Calculator display" aria-live="polite">
      <div className="display__expression" title={expression}>
        {expression || '\u00a0'}
      </div>
      <output
        className={`display__value${isError ? ' display__value--error' : ''}`}
        aria-label={isError ? 'Calculation error' : 'Current value'}
      >
        {value}
      </output>
    </section>
  )
}

export default CalculatorDisplay
