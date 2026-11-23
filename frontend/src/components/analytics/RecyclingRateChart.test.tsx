import { render } from '@testing-library/react'
import { RecyclingRateChart } from './RecyclingRateChart'

test('RecyclingRateChart renders the chart', () => {
  const { container } = render(<RecyclingRateChart />)
  expect(container).toBeTruthy()
  expect(container.firstChild).not.toBeNull()
})
