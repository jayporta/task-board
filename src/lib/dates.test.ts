import { describe, expect, it } from 'vitest'
import { isOverdue } from './dates'

describe('isOverdue', () => {
  it('compares calendar days, so a task due today is not yet overdue', () => {
    const now = new Date(2026, 6, 28) // 28 July 2026, local time
    const at = (day: number) => new Date(2026, 6, day).toISOString()

    expect(isOverdue(at(27), now)).toBe(true)
    expect(isOverdue(at(28), now)).toBe(false)
    expect(isOverdue(at(29), now)).toBe(false)
    expect(isOverdue(undefined, now)).toBe(false)
  })
})
