import type { App, Complexity } from '../types'

export function formatStartingPrice(app: App): string {
  if (app.startingPrice === null) return 'Get a Quote'
  return `From $${app.startingPrice.toLocaleString()}`
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const COMPLEXITY_LABELS: Record<Complexity, { label: string; color: string }> = {
  starter:    { label: 'Starter',    color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  standard:   { label: 'Standard',   color: 'text-blue-700 bg-blue-50 border-blue-200' },
  enterprise: { label: 'Enterprise', color: 'text-purple-700 bg-purple-50 border-purple-200' },
}

export const DEPLOYMENT_LABELS: Record<App['deploymentType'], string> = {
  web_app:       'Web App',
  mobile_app:    'Mobile App',
  api:           'API / Service',
  desktop:       'Desktop App',
  saas_platform: 'SaaS Platform',
}
