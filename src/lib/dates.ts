function startOfDay(date: Date): number {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

function parse(iso: string | undefined): Date | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}

/** "Jul 28", or "Jul 28, 2025" once the year differs from the current one. */
export function formatDate(iso: string | undefined, now = new Date(), locale?: string): string {
  const date = parse(iso)
  if (!date) return ''

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  }).format(date)
}

/** Compares calendar days, so a task due today is not yet overdue. */
export function isOverdue(iso: string | undefined, now = new Date()): boolean {
  const date = parse(iso)
  return date ? startOfDay(date) < startOfDay(now) : false
}

/** Today or tomorrow read better as words than as a date. */
export function describeDueDate(iso: string | undefined, now = new Date(), locale?: string): string {
  const date = parse(iso)
  if (!date) return ''

  const days = Math.round((startOfDay(date) - startOfDay(now)) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return formatDate(iso, now, locale)
}
