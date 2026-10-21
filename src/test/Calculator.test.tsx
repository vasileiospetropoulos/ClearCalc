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
})
