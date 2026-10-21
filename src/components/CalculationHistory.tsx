export type HistoryEntry = {
  id: number
  expression: string
  result: number
}

type CalculationHistoryProps = {
  entries: HistoryEntry[]
  onSelect: (result: number) => void
  onClear: () => void
  onClose: () => void
}

function CalculationHistory({
  entries,
  onSelect,
  onClear,
  onClose,
}: CalculationHistoryProps) {
  return (
    <aside className="history" aria-label="Calculation history">
      <div className="history__header">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h2>History</h2>
        </div>
        <button
          type="button"
          className="history__close"
          aria-label="Close history"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {entries.length === 0 ? (
        <p className="history__empty">Completed calculations will appear here.</p>
      ) : (
        <ol className="history__list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className="history__entry"
                aria-label={`Use result ${entry.result} from ${entry.expression}`}
                onClick={() => onSelect(entry.result)}
              >
                <span>{entry.expression}</span>
                <strong>{entry.result}</strong>
              </button>
            </li>
          ))}
        </ol>
      )}
      <button
        type="button"
        className="history__clear"
        onClick={onClear}
        disabled={entries.length === 0}
      >
        Clear history
      </button>
    </aside>
  )
}

export default CalculationHistory
