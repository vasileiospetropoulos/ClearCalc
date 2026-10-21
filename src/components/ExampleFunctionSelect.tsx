import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

export type FunctionExample = {
  label: string
  expression: string
  x: string
}

type ExampleFunctionSelectProps = {
  examples: FunctionExample[]
  onSelect: (example: FunctionExample) => void
}

function ExampleFunctionSelect({
  examples,
  onSelect,
}: ExampleFunctionSelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    optionRefs.current[activeIndex]?.focus()
  }, [activeIndex, open])

  const select = (index: number) => {
    const example = examples[index]
    if (!example) return
    setSelectedIndex(index)
    onSelect(example)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const openList = (index = selectedIndex ?? 0) => {
    setActiveIndex(index)
    setOpen(true)
  }

  const move = (next: number) => {
    const index = Math.max(0, Math.min(examples.length - 1, next))
    setActiveIndex(index)
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openList(
        event.key === 'ArrowDown'
          ? selectedIndex ?? 0
          : selectedIndex ?? examples.length - 1,
      )
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen((current) => !current)
    }
  }

  const onOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      move((index + 1) % examples.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      move((index + examples.length - 1) % examples.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      move(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      move(examples.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select(index)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (event.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className="example-select" ref={containerRef}>
      <button
        ref={triggerRef}
        id="function-example"
        type="button"
        className="example-select__trigger"
        role="combobox"
        aria-labelledby="function-example-label"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="function-example-listbox"
        aria-activedescendant={
          open ? `function-example-option-${activeIndex}` : undefined
        }
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <span>
          {selectedIndex === null
            ? 'Choose an example function'
            : `${examples[selectedIndex]?.label}: ${examples[selectedIndex]?.expression}`}
        </span>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div
          id="function-example-listbox"
          className="example-select__list"
          role="listbox"
          aria-label="Example functions"
        >
          {examples.map((example, index) => (
            <button
              ref={(element) => {
                optionRefs.current[index] = element
              }}
              id={`function-example-option-${index}`}
              key={example.label}
              type="button"
              role="option"
              aria-selected={selectedIndex === index}
              tabIndex={activeIndex === index ? 0 : -1}
              className={`example-select__option${selectedIndex === index ? ' example-select__option--selected' : ''}`}
              onClick={() => select(index)}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => onOptionKeyDown(event, index)}
            >
              <span>{example.label}</span>
              <code>{example.expression}</code>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExampleFunctionSelect
