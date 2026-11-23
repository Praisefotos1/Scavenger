import { render } from '@testing-library/react'
import { WasteTypeChart } from './WasteTypeChart'

test('WasteTypeChart renders the chart', () => {
  const { container } = render(<WasteTypeChart />)
  expect(container).toBeTruthy()
  expect(container.firstChild).not.toBeNull()
})
