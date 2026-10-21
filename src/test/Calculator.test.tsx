import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Calculator from '../components/Calculator'

async function clickButtons(...labels: string[]) {
  const user = userEvent.setup()
  for (const label of labels) {
    await user.click(screen.getByRole('button', { name: label }))
  }
}

describe('Calculator', () => {
  it('calculates a chained expression with precedence', async () => {
    render(<Calculator />)
    await clickButtons('2', 'Add', '3', 'Multiply', '4', 'Equals')
    expect(screen.getByLabelText('Current value')).toHaveTextContent('14')
  })

  it('replaces an operator before the next operand and repeats equals', async () => {
    render(<Calculator />)
    await clickButtons('2', 'Add', 'Multiply', '3', 'Equals', 'Equals')
    expect(screen.getByLabelText('Current value')).toHaveTextContent('18')
  })

  it('applies addition percentage to the preceding operand', async () => {
    render(<Calculator />)
    await clickButtons('2', '0', '0', 'Add', '1', '0', 'Percent', 'Equals')
    expect(screen.getByLabelText('Current value')).toHaveTextContent('220')
    expect(screen.getByLabelText('Calculator display')).toHaveTextContent(
      '200 + 10%',
    )
  })

  it('shows a recoverable division-by-zero error', async () => {
    render(<Calculator />)
    await clickButtons('8', 'Divide', '0', 'Equals')
    expect(
      screen.getByRole('status', { name: 'Calculation error' }),
    ).toHaveTextContent('Error')
    expect(screen.getByLabelText('Calculator display')).toHaveTextContent(
      'Cannot divide by zero.',
    )
    await clickButtons('7')
    expect(screen.getByLabelText('Current value')).toHaveTextContent('7')
  })

  it('uses keyboard input and ignores fields that accept text', () => {
    render(<Calculator />)
    fireEvent.keyDown(window, { key: '1' })
    fireEvent.keyDown(window, { key: '+' })
    fireEvent.keyDown(window, { key: '2' })
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(screen.getByLabelText('Current value')).toHaveTextContent('3')

    const input = document.createElement('input')
    document.body.append(input)
    fireEvent.keyDown(input, { key: '9' })
    expect(screen.getByLabelText('Current value')).toHaveTextContent('3')
    input.remove()
  })

  it('clears the current entry without discarding a pending operation', async () => {
    render(<Calculator />)
    await clickButtons('8', 'Add', '4', 'Clear entry', '2', 'Equals')
    expect(screen.getByLabelText('Current value')).toHaveTextContent('10')
  })

  it('deletes the last entered character and reports a missing operand', async () => {
    render(<Calculator />)
    await clickButtons('1', 'Decimal point', '2', 'Backspace')
    expect(screen.getByLabelText('Current value')).toHaveTextContent('1.')
    await clickButtons('Add', 'Equals')
    expect(screen.getByLabelText('Calculator display')).toHaveTextContent(
      'Enter a number to complete the calculation.',
    )
  })

  it('switches to scientific mode and evaluates a supported expression', async () => {
    render(<Calculator />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Scientific' }))
    await user.type(
      screen.getByRole('textbox', { name: 'Expression' }),
      'sqrt(9)+2^3',
    )
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(screen.getByText('Result').parentElement).toHaveTextContent('11')
    expect(screen.getByRole('button', { name: 'History 1' })).toBeInTheDocument()
  })

  it('evaluates an f(x) definition with implicit multiplication', async () => {
    render(<Calculator />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Function' }))
    const definition = screen.getByRole('textbox', { name: 'Function definition' })
    await user.clear(definition)
    await user.type(definition, 'f(x) = 2x + 1')
    const xValue = screen.getByRole('spinbutton', { name: 'Value of x' })
    await user.clear(xValue)
    await user.type(xValue, '3')
    await user.click(screen.getByRole('button', { name: 'Evaluate' }))
    expect(screen.getByText('Function result').parentElement).toHaveTextContent(
      'f(3) = 7',
    )
    expect(screen.getByRole('button', { name: 'History 1' })).toBeInTheDocument()
  })

  it('calculates precedence, parentheses, and decimals with the scientific keypad only', async () => {
    render(<Calculator />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Scientific' }))
    const keypad = within(
      screen.getByRole('group', { name: 'Scientific numeric keypad' }),
    )

    for (const label of ['2', 'Add', '3', 'Multiply', '4', 'Equals']) {
      await user.click(keypad.getByRole('button', { name: label }))
    }
    expect(screen.getByText('Result').parentElement).toHaveTextContent('14')

    await user.click(keypad.getByRole('button', { name: 'All clear' }))
    for (const label of [
      'Open parenthesis',
      '2',
      'Add',
      '3',
      'Close parenthesis',
      'Multiply',
      '4',
      'Equals',
    ]) {
      await user.click(keypad.getByRole('button', { name: label }))
    }
    expect(screen.getByText('Result').parentElement).toHaveTextContent('20')

    await user.click(keypad.getByRole('button', { name: 'All clear' }))
    for (const label of ['0', 'Decimal point', '1', 'Add', '0', 'Decimal point', '2', 'Equals']) {
      await user.click(keypad.getByRole('button', { name: label }))
    }
    expect(screen.getByText('Result').parentElement).toHaveTextContent('0.3')
  })

  it('inserts scientific function syntax that can be completed on-screen', async () => {
    render(<Calculator />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Scientific' }))
    const keypad = within(
      screen.getByRole('group', { name: 'Scientific numeric keypad' }),
    )
    await user.click(screen.getByRole('button', { name: 'Square root' }))
    await user.click(keypad.getByRole('button', { name: '9' }))
    await user.click(keypad.getByRole('button', { name: 'Close parenthesis' }))
    await user.click(keypad.getByRole('button', { name: 'Equals' }))
    expect(screen.getByText('Result').parentElement).toHaveTextContent('3')
  })

  it('uses the scientific exponent and factorial controls with keypad input', async () => {
    render(<Calculator />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Scientific' }))
    const keypad = within(
      screen.getByRole('group', { name: 'Scientific numeric keypad' }),
    )
    await user.click(keypad.getByRole('button', { name: '2' }))
    await user.click(screen.getByRole('button', { name: 'General exponentiation' }))
    await user.click(keypad.getByRole('button', { name: '3' }))
    await user.click(keypad.getByRole('button', { name: 'Equals' }))
    expect(screen.getByText('Result').parentElement).toHaveTextContent('8')

    await user.click(keypad.getByRole('button', { name: 'All clear' }))
    await user.click(keypad.getByRole('button', { name: '5' }))
    await user.click(screen.getByRole('button', { name: 'Factorial' }))
    expect(screen.getByText('Result').parentElement).toHaveTextContent('120')
  })

  it('supports physical keyboard arithmetic in scientific mode without intercepting expression typing', async () => {
    render(<Calculator />)
    await userEvent.setup().click(screen.getByRole('tab', { name: 'Scientific' }))
    fireEvent.keyDown(window, { key: '2' })
    fireEvent.keyDown(window, { key: '+' })
    fireEvent.keyDown(window, { key: '3' })
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(screen.getByText('Result').parentElement).toHaveTextContent('5')
  })

  it('allows keyboard selection in the compact example list', async () => {
    render(<Calculator />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('tab', { name: 'Function' }))
    const trigger = screen.getByRole('combobox', { name: 'Start with an example' })
    trigger.focus()
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(screen.getByRole('textbox', { name: 'Function definition' })).toHaveValue(
      'f(x) = 2x + 1',
    )
    expect(trigger).toHaveTextContent('Linear')
  })
})
