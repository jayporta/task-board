import { describe, expect, it } from 'vitest'
import { describeDueDate, isOverdue } from './dates'

const now = new Date(2026, 6, 28) // 28 July 2026, local time
const at = (year: number, month: number, day: number) => new Date(year, month, day).toISOString()

describe('isOverdue', () => {
  it('compares calendar days, so a task due today is not overdue', () => {
    expect(isOverdue(at(2026, 6, 27), now)).toBe(true)
    expect(isOverdue(at(2026, 6, 28), now)).toBe(false)
    expect(isOverdue(at(2026, 6, 29), now)).toBe(false)
  })

  it('is false without a usable date', () => {
    expect(isOverdue(undefined, now)).toBe(false)
  })
})

describe('describeDueDate', () => {
  it('names today and tomorrow, then falls back to a date', () => {
    expect(describeDueDate(at(2026, 6, 28), now, 'en-US')).toBe('Today')
    expect(describeDueDate(at(2026, 6, 29), now, 'en-US')).toBe('Tomorrow')
    expect(describeDueDate(at(2026, 6, 31), now, 'en-US')).toBe('Jul 31')
  })
})
