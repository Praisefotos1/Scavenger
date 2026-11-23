import { render } from '@testing-library/react'
import { TopMaterialsChart } from './TopMaterialsChart'

test('TopMaterialsChart renders the chart', () => {
  const { container } = render(<TopMaterialsChart />)
  expect(container).toBeTruthy()
  expect(container.firstChild).not.toBeNull()
})
