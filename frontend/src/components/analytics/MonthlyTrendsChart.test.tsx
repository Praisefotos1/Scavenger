import { render } from '@testing-library/react'
import { MonthlyTrendsChart } from './MonthlyTrendsChart'

test('MonthlyTrendsChart renders the chart', () => {
  const { container } = render(<MonthlyTrendsChart />)
  expect(container).toBeTruthy()
  expect(container.firstChild).not.toBeNull()
})
