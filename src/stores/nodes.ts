import type { MonitorNode } from '@/utils/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/** 流量限制类型 */
export type TrafficLimitType = 'up' | 'down' | 'min' | 'max' | 'sum'

export interface NodeStatusPing {
  name: string
  latest: number
  avg: number
  tail: number
  loss: number
  min: number
  max: number
}

/** 节点完整信息 */
export interface NodeData {
  uuid: string
  id: number
  // Client 信息
  name: string
  cpu_name: string
  virtualization: string
  arch: string
  cpu_cores: number
  os: string
  kernel_version: string
  gpu_name?: string
  ipv4?: string
  ipv6?: string
  region: string
  remark?: string
  public_remark: string
  mem_total: number
  swap_total: number
  disk_total: number
  version?: string
  weight: number
  price: number
  billing_cycle: number
  auto_renewal: boolean
  currency: string
  expired_at: string
  expires_in?: number | null
  group: string
  tags: string
  hidden: boolean
  traffic_limit: number
  traffic_limit_type: TrafficLimitType
  month_used?: number
  created_at: string
  updated_at: string
  // Status 信息
  online: boolean
  time: string
  cpu: number
  gpu: number
  ram: number
  ram_total: number
  swap: number
  load: number
  load5: number
  load15: number
  temp: number
  disk: number
  net_in: number
  net_out: number
  net_total_up: number
  net_total_down: number
  month_rx: number
  month_tx: number
  process: number
  connections: number
  connections_udp: number
  uptime: number
  ping?: Record<string, NodeStatusPing>
}

/** WebSocket 连接状态 */
export type WsConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

const EARTH_SNAPSHOT_INTERVAL_MS = 60_000

export function parseBillingCycleMonths(cycle: string): number {
  const named: Record<string, number> = {
    monthly: 1,
    quarterly: 3,
    semiannual: 6,
    yearly: 12,
    biennial: 24,
    triennial: 36,
  }
  if (cycle === 'once')
    return 0
  return named[cycle] ?? Number(/^(\d+)m$/.exec(cycle)?.[1]) ?? 1
}

function parseTrafficMode(mode: string): TrafficLimitType {
  const lower = (mode || '').toLowerCase()
  if (lower === 'in' || lower === 'down' || lower === 'rx')
    return 'down'
  if (lower === 'out' || lower === 'up' || lower === 'tx')
    return 'up'
  if (lower === 'min')
    return 'min'
  if (lower === 'max')
    return 'max'
  return 'sum'
}

export function convertMonitorNodeToNodeData(node: MonitorNode): NodeData {
  const m = node.metrics
  const hasMetrics = node.online && m !== null

  return {
    uuid: String(node.id),
    id: node.id,
    name: node.name,
    cpu_name: node.cpu_name || '',
    virtualization: node.virt || '',
    arch: node.arch || '',
    cpu_cores: node.cpu_cores || 1,
    os: node.os || '',
    kernel_version: node.kernel || '',
    gpu_name: undefined,
    ipv4: node.ip,
    ipv6: undefined,
    region: node.country || '',
    remark: node.remark,
    public_remark: node.remark || '',
    mem_total: m?.mem_total ?? node.mem_total ?? 0,
    swap_total: m?.swap_total ?? node.swap_total ?? 0,
    disk_total: m?.disk_total ?? node.disk_total ?? 0,
    version: node.agent_version,
    weight: node.sort ?? 0,
    price: node.price ?? 0,
    billing_cycle: parseBillingCycleMonths(node.billing_cycle),
    auto_renewal: false,
    currency: node.currency || 'USD',
    expired_at: node.expires_at || '',
    expires_in: node.expires_in,
    group: node.group || '',
    tags: '',
    hidden: !node.public,
    traffic_limit: node.traffic_limit ?? 0,
    traffic_limit_type: parseTrafficMode(node.traffic_mode),
    month_used: node.month_used,
    created_at: '',
    updated_at: '',
    online: node.online,
    time: node.last_seen ? new Date(node.last_seen * 1000).toISOString() : '',
    cpu: hasMetrics ? m.cpu : 0,
    gpu: 0,
    ram: hasMetrics ? m.mem_used : 0,
    ram_total: hasMetrics ? m.mem_total : (node.mem_total ?? 0),
    swap: hasMetrics ? m.swap_used : 0,
    load: hasMetrics && m.load ? m.load[0] : 0,
    load5: hasMetrics && m.load ? m.load[1] : 0,
    load15: hasMetrics && m.load ? m.load[2] : 0,
    temp: 0,
    disk: hasMetrics ? m.disk_used : 0,
    net_in: hasMetrics ? m.net_rx : 0,
    net_out: hasMetrics ? m.net_tx : 0,
    net_total_up: hasMetrics ? m.total_tx : (node.total_tx ?? 0),
    net_total_down: hasMetrics ? m.total_rx : (node.total_rx ?? 0),
    month_rx: hasMetrics ? m.month_rx : (node.month_rx ?? 0),
    month_tx: hasMetrics ? m.month_tx : (node.month_tx ?? 0),
    process: hasMetrics ? m.procs : 0,
    connections: hasMetrics ? m.tcp : 0,
    connections_udp: hasMetrics ? m.udp : 0,
    uptime: hasMetrics ? m.uptime : 0,
    ping: undefined,
  }
}

const useNodesStore = defineStore('nodes', () => {
  // ===== 状态 =====
  const nodes = ref<NodeData[]>([])
  const earthNodes = ref<NodeData[]>([])
  const wsConnectionState = ref<WsConnectionState>('disconnected')
  const wsReconnectAttempts = ref<number>(0)
  let lastEarthSnapshotAt = 0

  // ===== 计算属性 =====
  /** 在线节点数量 */
  const onlineCount = computed(() => nodes.value.filter(n => n.online).length)

  /** 总节点数量 */
  const totalCount = computed(() => nodes.value.length)

  /** 所有分组：按节点第一次出现的顺序排列 */
  const groups = computed(() => {
    return [...new Set(nodes.value.map(n => n.group ?? '').filter(Boolean))]
  })

  /** 按 UUID / ID 索引的节点映射 */
  const nodesByUuid = computed(() => {
    const map = new Map<string, NodeData>()
    nodes.value.forEach((n) => {
      map.set(n.uuid, n)
    })
    return map
  })

  // ===== 方法 =====

  /**
   * Earth 视图共享采样快照，避免频繁重绘
   */
  function refreshEarthNodes(force = false): void {
    const now = Date.now()
    if (!force && now - lastEarthSnapshotAt < EARTH_SNAPSHOT_INTERVAL_MS)
      return

    earthNodes.value = [...nodes.value]
    lastEarthSnapshotAt = now
  }

  /**
   * 设置/更新全量节点数据
   */
  function setNodesFromMonitor(monitorNodes: MonitorNode[]): void {
    const list = monitorNodes.map(convertMonitorNodeToNodeData)
    nodes.value = list
    refreshEarthNodes(true)
  }

  /**
   * 更新 WebSocket 连接状态
   */
  function updateWsState(state: WsConnectionState, attempts?: number): void {
    wsConnectionState.value = state
    if (attempts !== undefined) {
      wsReconnectAttempts.value = attempts
    }
  }

  /**
   * 清空所有节点数据
   */
  function clearNodes(): void {
    nodes.value = []
    refreshEarthNodes(true)
  }

  return {
    // 状态
    nodes,
    earthNodes,
    wsConnectionState,
    wsReconnectAttempts,
    // 计算属性
    onlineCount,
    totalCount,
    groups,
    nodesByUuid,
    // 方法
    setNodesFromMonitor,
    updateWsState,
    clearNodes,
  }
})

export { useNodesStore }
