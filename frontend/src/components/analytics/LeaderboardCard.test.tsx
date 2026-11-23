import { render } from '@testing-library/react'
import { LeaderboardCard } from './LeaderboardCard'

test('LeaderboardCard renders', () => {
  const { container } = render(<LeaderboardCard />)
  expect(container).toBeTruthy()
  expect(container.firstChild).not.toBeNull()
})
