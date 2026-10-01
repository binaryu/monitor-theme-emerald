import type { NodeData } from '@/stores/nodes'

const FINANCE_CURRENCY_CONFIG = {
  AUD: { rate: 0.20941, symbol: 'A$' },
  BRL: { rate: 0.74734, symbol: 'R$' },
  CAD: { rate: 0.20691, symbol: 'C$' },
  CHF: { rate: 0.11746, symbol: 'CHF' },
  CNY: { rate: 1, symbol: '¥' },
  CZK: { rate: 3.0787, symbol: 'Kč' },
  DKK: { rate: 0.95296, symbol: 'kr' },
  EUR: { rate: 0.1275, symbol: '€' },
  GBP: { rate: 0.11027, symbol: '£' },
  HKD: { rate: 1.1594, symbol: '$' },
  HUF: { rate: 44.688, symbol: 'Ft' },
  IDR: { rate: 2622.37, symbol: 'Rp' },
  ILS: { rate: 0.43085, symbol: '₪' },
  INR: { rate: 14.0178, symbol: '₹' },
  ISK: { rate: 18.4626, symbol: 'kr' },
  JPY: { rate: 23.707, symbol: '¥' },
  KRW: { rate: 224.11, symbol: '₩' },
  KZT: { rate: 64, symbol: '₸' },
  MXN: { rate: 2.5472, symbol: 'Mex$' },
  MYR: { rate: 0.59945, symbol: 'RM' },
  NOK: { rate: 1.4096, symbol: 'kr' },
  NZD: { rate: 0.2535, symbol: 'NZ$' },
  PHP: { rate: 8.9288, symbol: '₱' },
  PLN: { rate: 0.54138, symbol: 'zł' },
  RON: { rate: 0.66769, symbol: 'lei' },
  RUB: { rate: 11.9, symbol: '₽' },
  SEK: { rate: 1.3895, symbol: 'kr' },
  SGD: { rate: 0.18975, symbol: 'S$' },
  THB: { rate: 4.8172, symbol: '฿' },
  TRY: { rate: 6.849, symbol: '₺' },
  UAH: { rate: 3.6, symbol: '₴' },
  USD: { rate: 0.14799, symbol: '$' },
  VND: { rate: 3500, symbol: '₫' },
  ZAR: { rate: 2.3995, symbol: 'R' },
} as const

export type CurrencyCode = keyof typeof FINANCE_CURRENCY_CONFIG
export const SUPPORTED_FINANCE_CURRENCIES = Object.keys(FINANCE_CURRENCY_CONFIG) as CurrencyCode[]
export const DISPLAY_FINANCE_CURRENCIES = [
  'CNY',
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'HKD',
  'KRW',
  'RUB',
  'BRL',
  'INR',
  'AUD',
  'CAD',
  'SGD',
  'THB',
  'VND',
  'MYR',
  'PHP',
  'IDR',
  'NZD',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'TRY',
  'ZAR',
  'KZT',
  'UAH',
  'CHF',
] as const satisfies readonly CurrencyCode[]
export type ExchangeRates = Record<CurrencyCode, number> & { [code: string]: number | undefined }
export type ExchangeRateSource = 'cache' | 'network' | 'stale-cache' | 'default'

interface ExchangeRatesCache {
  base: 'CNY'
  date: string
  fetchedAt: number
  rates: Partial<Record<CurrencyCode, number>>
}

const CACHE_KEY = 'komari_finance_exchange_rates_cny_v1'
const MS_PER_DAY = 24 * 60 * 60 * 1000
const LONG_TERM_YEARS = 100
const ISO_CURRENCY_REGEX = /^[A-Z]{3}$/

export const DEFAULT_EXCHANGE_RATES = Object.fromEntries(
  Object.entries(FINANCE_CURRENCY_CONFIG).map(([currency, config]) => [currency, config.rate]),
) as ExchangeRates

export const CURRENCY_SYMBOLS = Object.fromEntries(
  Object.entries(FINANCE_CURRENCY_CONFIG).map(([currency, config]) => [currency, config.symbol]),
) as Record<CurrencyCode, string>

const EXCHANGE_RATE_APIS = [
  {
    url: 'https://api.frankfurter.app/latest?from=CNY',
    parse: (data: unknown) => (data as { rates?: unknown }).rates,
  },
  {
    url: 'https://open.er-api.com/v6/latest/CNY',
    parse: (data: unknown) => (data as { rates?: unknown }).rates,
  },
] as const
const EXPLICIT_CURRENCY_ALIASES: Record<string, CurrencyCode> = {
  '$': 'USD',
  'US$': 'USD',
  'CA$': 'CAD',
  'CN¥': 'CNY',
  'RMB': 'CNY',
  'HK$': 'HKD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'CNY',
  '￥': 'CNY',
  'JP¥': 'JPY',
}
const CURRENCY_SYMBOL_ALIASES = createCurrencySymbolAliases()

export function normalizeCurrency(currency: string | null | undefined): CurrencyCode {
  const value = String(currency || 'CNY').trim().toUpperCase()

  if (isSupportedCurrency(value))
    return value

  return EXPLICIT_CURRENCY_ALIASES[value] || CURRENCY_SYMBOL_ALIASES[value] || 'CNY'
}

export function isSupportedCurrency(currency: string): currency is CurrencyCode {
  return (SUPPORTED_FINANCE_CURRENCIES as readonly string[]).includes(currency)
}

function createCurrencySymbolAliases(): Record<string, CurrencyCode> {
  const symbolEntries = Object.entries(FINANCE_CURRENCY_CONFIG).map(([currency, config]) => [
    config.symbol.trim().toUpperCase(),
    currency as CurrencyCode,
  ] as const)

  const symbolCounts = symbolEntries.reduce<Record<string, number>>((counts, [symbol]) => {
    counts[symbol] = (counts[symbol] || 0) + 1
    return counts
  }, {})

  return symbolEntries.reduce<Record<string, CurrencyCode>>((aliases, [symbol, currency]) => {
    if (symbol && symbolCounts[symbol] === 1)
      aliases[symbol] = currency

    return aliases
  }, {})
}

export function getTodayDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function shouldExcludeFreeNodes(): boolean {
  const value = getLocalStorageItem('fin_exclude_free')
  return value === null ? true : value === 'true'
}

export function getStoredFinanceCurrency(): CurrencyCode {
  return normalizeCurrency(getLocalStorageItem('fin_currency') || 'CNY')
}

export function setStoredFinanceCurrency(currency: CurrencyCode): void {
  setLocalStorageItem('fin_currency', currency)
}

export function calculateTotalRemainingValueCNY(
  nodes: NodeData[],
  exchangeRates: ExchangeRates,
  excludeFreeTags = true,
  now = new Date(),
): number {
  return nodes.reduce((sum, node) => {
    if (excludeFreeTags && node.tags?.includes('白嫖中'))
      return sum

    return sum + calculateRemainingValueCNY(node, exchangeRates, now)
  }, 0)
}

export function calculateTotalValueCNY(
  nodes: NodeData[],
  exchangeRates: ExchangeRates,
  excludeFreeTags = true,
): number {
  return nodes.reduce((sum, node) => {
    if (excludeFreeTags && node.tags?.includes('白嫖中'))
      return sum

    return sum + getPriceCNY(node, exchangeRates)
  }, 0)
}

export function calculateValueCNY(
  node: NodeData,
  exchangeRates: ExchangeRates,
): number {
  return getPriceCNY(node, exchangeRates)
}

export function calculateTotalMonthlyAverageCostCNY(
  nodes: NodeData[],
  exchangeRates: ExchangeRates,
  excludeFreeTags = true,
): number {
  return nodes.reduce((sum, node) => {
    if (excludeFreeTags && node.tags?.includes('白嫖中'))
      return sum

    return sum + calculateMonthlyAverageCostCNY(node, exchangeRates)
  }, 0)
}

/**
 * 获取计费周期的总天数
 * @param billingCycle 计费周期（月数或天数）
 */
export function getCycleDays(billingCycle: number): number {
  if (billingCycle === 1)
    return 30
  if (billingCycle === 3)
    return 91
  if (billingCycle === 6)
    return 182
  if (billingCycle === 12)
    return 365
  if (billingCycle === 24)
    return 730
  if (billingCycle === 36)
    return 1095
  if (billingCycle === 60)
    return 1825
  if (billingCycle > 0 && billingCycle % 12 === 0)
    return (billingCycle / 12) * 365
  if (billingCycle > 0 && billingCycle <= 1200)
    return billingCycle * 30
  if (billingCycle > 1200)
    return billingCycle
  return 0
}

export function calculateMonthlyAverageCostCNY(
  node: NodeData,
  exchangeRates: ExchangeRates,
): number {
  const priceCNY = getPriceCNY(node, exchangeRates)
  if (priceCNY <= 0)
    return 0

  const billingCycle = Number(node.billing_cycle)
  if (!Number.isFinite(billingCycle) || billingCycle <= 0)
    return 0

  // 周期大于 1200 说明为天数
  if (billingCycle > 1200) {
    return (priceCNY / billingCycle) * 30
  }

  // 否则 billingCycle 为月数（1 为月付，12 为年付，36 为三年付等）
  return priceCNY / billingCycle
}

export function calculateRemainingValueCNY(
  node: NodeData,
  exchangeRates: ExchangeRates,
  now = new Date(),
): number {
  const priceCNY = getPriceCNY(node, exchangeRates)
  if (priceCNY <= 0)
    return 0

  const billingCycle = Number(node.billing_cycle)
  if (!Number.isFinite(billingCycle) || billingCycle <= 0)
    return 0

  // 1. 获取剩余天数：优先使用 hub 提供的精确 expires_in，无则按 expired_at 计算
  let remainingDays = 0
  if (typeof node.expires_in === 'number') {
    remainingDays = node.expires_in
  }
  else if (node.expired_at) {
    const expiredAt = new Date(node.expired_at).getTime()
    if (Number.isFinite(expiredAt)) {
      const diffMs = expiredAt - now.getTime()
      remainingDays = diffMs / MS_PER_DAY
    }
  }

  // 已过期
  if (remainingDays <= 0)
    return 0

  // 超过 100 年视为长期传家宝，剩余价值即当前周期总价
  if (remainingDays > LONG_TERM_YEARS * 365)
    return priceCNY

  // 2. 获取计费周期天数
  const cycleDays = getCycleDays(billingCycle)
  if (cycleDays <= 0)
    return 0

  // 剩余价值 = (单周期单日费用) * 剩余天数
  return (priceCNY / cycleDays) * remainingDays
}

export function formatFinanceAmount(amount: number, currency: CurrencyCode): {
  currency: CurrencyCode
  symbol: string
  value: string
} {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const value = new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Math.abs(safeAmount) < 100000 ? 2 : 0,
    notation: Math.abs(safeAmount) >= 100000 ? 'compact' : 'standard',
  }).format(safeAmount)

  return {
    currency,
    symbol: CURRENCY_SYMBOLS[currency],
    value,
  }
}

export async function getDailyExchangeRates(): Promise<{
  rates: ExchangeRates
  source: ExchangeRateSource
}> {
  const today = getTodayDateKey()
  const cached = readCachedExchangeRates()

  if (cached && cached.date === today) {
    return {
      rates: cached.rates,
      source: 'cache',
    }
  }

  const fetchedRates = await fetchExchangeRates()
  if (fetchedRates) {
    writeCachedExchangeRates(fetchedRates, today)
    return {
      rates: fetchedRates,
      source: 'network',
    }
  }

  if (cached) {
    return {
      rates: cached.rates,
      source: 'stale-cache',
    }
  }

  return {
    rates: DEFAULT_EXCHANGE_RATES,
    source: 'default',
  }
}

function getPriceCNY(node: NodeData, exchangeRates: ExchangeRates): number {
  const price = Number(node.price)
  if (!Number.isFinite(price) || price <= 0)
    return 0

  const rawCode = String(node.currency || '').trim().toUpperCase()
  // 支持其他任意 ISO 4217 三字母币种
  if (ISO_CURRENCY_REGEX.test(rawCode) && !(SUPPORTED_FINANCE_CURRENCIES as string[]).includes(rawCode)) {
    const rate = exchangeRates[rawCode]
    return rate && rate > 0 ? price / rate : 0
  }

  const currency = normalizeCurrency(node.currency)
  if (currency === 'CNY')
    return price

  const rate = exchangeRates[currency]
  return rate && rate > 0 ? price / rate : 0
}

async function fetchExchangeRates(): Promise<ExchangeRates | null> {
  for (const api of EXCHANGE_RATE_APIS) {
    try {
      const response = await fetchWithTimeout(api.url)
      if (!response.ok)
        continue

      const data = await response.json()
      const rates = sanitizeExchangeRates(api.parse(data))
      if (rates)
        return rates
    }
    catch (error) {
      console.warn(`获取汇率失败: ${api.url}`, error)
    }
  }

  return null
}

export async function fetchWithTimeout(url: string, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { signal: controller.signal })
  }
  finally {
    window.clearTimeout(timeoutId)
  }
}

function readCachedExchangeRates(): { date: string, rates: ExchangeRates } | null {
  try {
    const rawValue = getLocalStorageItem(CACHE_KEY)
    if (!rawValue)
      return null

    const cache = JSON.parse(rawValue) as ExchangeRatesCache
    const rates = sanitizeExchangeRates(cache.rates)
    if (cache.base !== 'CNY' || !cache.date || !rates)
      return null

    return {
      date: cache.date,
      rates,
    }
  }
  catch {
    return null
  }
}

function writeCachedExchangeRates(rates: ExchangeRates, date: string): void {
  const cache: ExchangeRatesCache = {
    base: 'CNY',
    date,
    fetchedAt: Date.now(),
    rates,
  }
  setLocalStorageItem(CACHE_KEY, JSON.stringify(cache))
}

function sanitizeExchangeRates(rates: unknown): ExchangeRates | null {
  if (!rates || typeof rates !== 'object')
    return null

  const record = rates as Record<string, unknown>
  const result = { CNY: 1 } as ExchangeRates

  for (const currency of SUPPORTED_FINANCE_CURRENCIES) {
    if (currency === 'CNY')
      continue

    const value = Number(record[currency])
    if (!Number.isFinite(value) || value <= 0)
      return null

    result[currency] = value
  }

  for (const [code, raw] of Object.entries(record)) {
    const value = Number(raw)
    if (ISO_CURRENCY_REGEX.test(code) && !(code in result) && Number.isFinite(value) && value > 0)
      result[code] = value
  }

  return result
}

function getLocalStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  }
  catch {
    return null
  }
}

function setLocalStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  }
  catch {
    // 缓存失败不应阻断价值计算，下一次刷新会重新尝试获取汇率。
  }
}
