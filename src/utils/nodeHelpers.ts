import type { NodeData, TrafficLimitType } from '@/stores/nodes'
import { formatDateTime } from '@/utils/helper'
import { formatPriceWithCycle, getDaysUntilExpired, getExpireStatus, getExpireTextClass, parseTags } from '@/utils/tagHelper'

export interface PriceTagItem {
  text: string
  highlight?: boolean
}

export function hasRegion(region: string | null | undefined): boolean {
  return Boolean(region?.trim())
}

export function calculateTrafficUsed(upload: number, download: number, type: TrafficLimitType): number {
  switch (type) {
    case 'up': return upload
    case 'down': return download
    case 'min': return Math.min(upload, download)
    case 'max': return Math.max(upload, download)
    case 'sum':
    default: return upload + download
  }
}

export function showTrafficProgress(node: NodeData): boolean {
  return node.traffic_limit > 0
}

export function getTrafficUsed(node: NodeData): number {
  if (typeof node.month_used === 'number' && node.month_used >= 0)
    return node.month_used

  // 优先按月流量计算，无月流量时退回累计流量
  const up = node.month_tx > 0 || node.month_rx > 0 ? node.month_tx : node.net_total_up
  const down = node.month_tx > 0 || node.month_rx > 0 ? node.month_rx : node.net_total_down
  return calculateTrafficUsed(up, down, node.traffic_limit_type)
}

export function getTrafficUsedPercentage(node: NodeData): number {
  if (node.traffic_limit <= 0)
    return 0
  const used = getTrafficUsed(node)
  return Math.min((used / node.traffic_limit) * 100, 100)
}

export function getPriceTags(node: NodeData, lang: 'zh-CN' | 'en-US'): PriceTagItem[] {
  const tags: PriceTagItem[] = []
  const days = getDaysUntilExpired(node.expired_at, node.expires_in)
  const status = getExpireStatus(node.expired_at, node.expires_in)
  const priceText = formatPriceWithCycle(node.price, node.billing_cycle, node.currency, lang)
  if (node.price !== 0)
    tags.push({ text: priceText })
  if (status === 'long_term')
    tags.push({ text: lang === 'zh-CN' ? '长期' : 'Long-term' })
  else if (lang === 'zh-CN')
    tags.push({ text: `${days >= 0 ? '+' : ''}${days}天`, highlight: true })
  else
    tags.push({ text: `${days >= 0 ? '+' : ''}${days}d`, highlight: true })
  return tags
}

export function getRemainingTimeTagClass(node: NodeData): string {
  if (node.price === 0)
    return ''
  return getExpireTextClass(node.expired_at)
}

export function getCustomTags(node: NodeData): string[] {
  return parseTags(node.tags).map(t => t.text)
}

/**
 * 把公开备注按分号拆成多个标签，备注里用 `;` 分隔即显示为独立 badge
 */
export function getRemarkTags(remark: string | undefined): string[] {
  if (!remark)
    return []
  return remark.split(';').map(t => t.trim()).filter(Boolean)
}

/**
 * 格式化离线时长（按 hub 时钟计算的秒数 last_seen_ago）
 * - null: 从未上报
 * - 数值: 不足 1 分钟 / N 分钟 / N 小时 / N 天
 */
export function formatOfflineDuration(lastSeenAgo: number | null | undefined): string {
  if (lastSeenAgo === null)
    return '从未上报'
  if (lastSeenAgo === undefined || Number.isNaN(lastSeenAgo))
    return '离线'
  if (lastSeenAgo < 60)
    return '不足 1 分钟'

  const minutes = Math.floor(lastSeenAgo / 60)
  if (minutes < 60)
    return `${minutes} 分钟`

  const hours = Math.floor(minutes / 60)
  const remMinutes = minutes % 60
  if (hours < 24) {
    return remMinutes > 0 ? `${hours} 小时 ${remMinutes} 分钟` : `${hours} 小时`
  }

  const days = Math.floor(hours / 24)
  const remHours = hours % 24
  return remHours > 0 ? `${days} 天 ${remHours} 小时` : `${days} 天`
}

export function formatOfflineTime(node: NodeData): string {
  if (node.last_seen_ago === null)
    return '从未上报'
  if (typeof node.last_seen_ago === 'number')
    return `离线 ${formatOfflineDuration(node.last_seen_ago)}`
  return formatDateTime(node.time)
}

export function getMemPercentage(node: NodeData): number {
  return (node.ram ?? 0) / (node.mem_total || 1) * 100
}

export function getDiskPercentage(node: NodeData): number {
  return (node.disk ?? 0) / (node.disk_total || 1) * 100
}
