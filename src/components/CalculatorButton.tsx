import type { MouseEventHandler, ReactNode } from 'react'

type CalculatorButtonProps = {
  children: ReactNode
  label: string
  kind?: 'utility' | 'operator' | 'equals' | 'number'
  onClick: MouseEventHandler<HTMLButtonElement>
}

function CalculatorButton({
  children,
  label,
  kind = 'number',
  onClick,
}: CalculatorButtonProps) {
  return (
    <button
      type="button"
      className={`calculator-button calculator-button--${kind}`}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default CalculatorButton
