import { render } from '@testing-library/react'
import { ParticipantContributionChart } from './ParticipantContributionChart'

test('ParticipantContributionChart renders the chart', () => {
  const { container } = render(<ParticipantContributionChart />)
  expect(container).toBeTruthy()
  expect(container.firstChild).not.toBeNull()
})
