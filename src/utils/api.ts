/**
 * monitor-probe REST API & WebSocket Client
 * 适用于 monitor-theme-emerald
 */

import manifest from '../../theme.json' with { type: 'json' }

export interface MeResponse {
  site_name?: string
  sitename?: string
  authed: boolean
  public?: boolean
  public_page?: boolean
  history_days?: number
  site?: string
}

export interface PublicSettings {
  sitename: string
  authed: boolean
  public: boolean
  theme_settings?: Record<string, unknown>
}

export interface Metrics {
  uptime: number
  cpu: number
  load: [number, number, number]
  mem_total: number
  mem_used: number
  swap_total: number
  swap_used: number
  disk_total: number
  disk_used: number
  net_rx: number
  net_tx: number
  total_rx: number
  total_tx: number
  month_rx: number
  month_tx: number
  tcp: number
  udp: number
  procs: number
}

export interface MonitorNode {
  id: number
  name: string
  sort: number
  public: boolean
  online: boolean
  country: string
  group?: string
  last_seen: number
  metrics: Metrics | null
  os: string
  kernel: string
  arch: string
  virt: string
  cpu_name: string
  cpu_cores: number
  mem_total: number
  swap_total: number
  disk_total: number
  agent_version: string
  price: number
  currency: string
  billing_cycle: string
  expires_at: string | null
  expires_in?: number | null
  traffic_limit: number
  traffic_mode: string
  traffic_reset_day: number
  total_rx: number
  total_tx: number
  month_rx: number
  month_tx: number
  month_used?: number
  month_start: string
  day_rx: number
  day_tx: number
  hostname?: string
  ip?: string
  ipv4?: string
  ipv6?: string
  addresses?: { address: string, source?: string }[]
  remark?: string
}

export interface NodesResponse {
  nodes: MonitorNode[]
}

export interface MetricsPoint {
  ts: number
  cpu: number
  mem_used: number
  disk_used: number
  net_rx: number
  net_tx: number
  net_rx_max?: number
  net_tx_max?: number
}

export interface PingPoint {
  task_id: number
  ts: number
  latency: number | null
  band?: [number, number]
  loss?: number
}

export interface NodeMetricsResponse {
  metrics?: MetricsPoint[]
  ping?: PingPoint[]
  probes?: Record<string, string>
  loss?: Record<string, number>
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function failure(res: Response): Promise<ApiError> {
  const text = res.headers.get('content-type')?.startsWith('text/plain') ? (await res.text()).trim() : ''
  return new ApiError(
    res.status,
    text || (res.status >= 500 ? `服务暂时无法访问（HTTP ${res.status}），稍后再试` : `请求被拦截（HTTP ${res.status}），稍后再试`),
  )
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: init?.body ? { 'content-type': 'application/json', ...init?.headers } : init?.headers,
    })
  }
  catch {
    throw new ApiError(0, '网络连接失败，稍后再试')
  }
  if (!res.ok)
    throw await failure(res)
  if (res.status === 204)
    return undefined as T
  return res.json().catch(() => {
    throw new ApiError(res.status, '收到的不是状态数据，稍后再试')
  })
}

/** 获取当前站点状态和用户信息 */
export function getMe(): Promise<MeResponse> {
  return api<MeResponse>('/me')
}

/** 获取全部节点信息 */
export function getNodes(): Promise<NodesResponse> {
  return api<NodesResponse>('/nodes')
}

/** 获取指定节点的历史指标与延迟记录 */
export function getNodeMetrics(
  id: number | string,
  params?: { hours?: number, points?: number, series?: 'metrics' | 'ping' },
): Promise<NodeMetricsResponse> {
  const query = new URLSearchParams()
  if (params?.hours)
    query.set('hours', String(params.hours))
  if (params?.points)
    query.set('points', String(params.points))
  if (params?.series)
    query.set('series', params.series)

  const qs = query.toString()
  return api<NodeMetricsResponse>(`/nodes/${id}/metrics${qs ? `?${qs}` : ''}`)
}

/** 主题配置字段类型声明 */
export interface ConfigField {
  key: string
  type: string
  default: unknown
  options?: { value: string, label: string }[]
  min?: number
  max?: number
}

function fits(field: ConfigField, value: unknown): boolean {
  switch (field.type) {
    case 'boolean':
      return typeof value === 'boolean'
    case 'number':
      return typeof value === 'number' && Number.isFinite(value)
        && value >= (field.min ?? -Infinity) && value <= (field.max ?? Infinity)
    case 'select':
      return !!field.options?.some(option => option.value === value)
    default:
      return typeof value === 'string'
  }
}

export const themeFields = (manifest.config as ConfigField[]).filter(f => f.type !== 'title')

/** 加载主题配置 */
export async function loadThemeConfig(): Promise<Record<string, unknown>> {
  let saved: Record<string, unknown> = {}
  try {
    const res = await fetch(`/api/themes/${manifest.short}/config`)
    if (res.ok)
      saved = await res.json()
  }
  catch {
    // 失败按默认值渲染
  }
  const pick = (f: ConfigField) => (fits(f, saved[f.key]) ? saved[f.key] : f.default)
  return Object.fromEntries(themeFields.map(f => [f.key, pick(f)]))
}

/** 保存主题配置（管理员） */
export async function saveThemeConfig(values: Record<string, unknown>): Promise<void> {
  const url = `/api/themes/${manifest.short}/config`
  const read = await fetch(url)
  if (!read.ok)
    throw new Error(await read.text())
  const next: Record<string, unknown> = await read.json()
  for (const f of themeFields) {
    if (values[f.key] === f.default)
      delete next[f.key]
    else next[f.key] = values[f.key]
  }
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(next),
  })
  if (!res.ok)
    throw new Error(await res.text())
}

/** 校验节点数据完整性，防止异常节点导致页面白屏 */
export function safeNodes(nodes: MonitorNode[]): MonitorNode[] {
  const number = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0
  const fields = [
    'uptime',
    'cpu',
    'mem_total',
    'mem_used',
    'swap_total',
    'swap_used',
    'disk_total',
    'disk_used',
    'net_rx',
    'net_tx',
    'total_rx',
    'total_tx',
    'month_rx',
    'month_tx',
    'tcp',
    'udp',
    'procs',
  ] as const

  return nodes.map((node) => {
    const m = node.metrics
    return !m || (fields.every(key => number(m[key])) && Array.isArray(m.load) && m.load.length === 3 && m.load.every(number))
      ? node
      : { ...node, metrics: null }
  })
}
