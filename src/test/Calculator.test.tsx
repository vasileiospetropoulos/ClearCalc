import { fireEvent, render, screen } from '@testing-library/react'
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
})
