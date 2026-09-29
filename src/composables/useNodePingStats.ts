import type { MaybeRefOrGetter } from 'vue'
import { computed, ref, shallowRef, toValue, watch } from 'vue'
import { getNodeMetrics } from '@/utils/api'

export interface NodePingHistoryPoint {
  time: string
  latency: number | null
  loss: number | null
}

export interface NodePingStatsState {
  avgLatency: number
  avgLoss: number
  avgVolatility: number
  history: NodePingHistoryPoint[]
  hasData: boolean
  perTaskStats: NodePingPerTaskStat[]
}

interface PingRecord {
  client: string
  task_id: number
  time: string
  value: number
}

interface PingTaskInfo {
  id: number
  name: string
}

export interface NodePingPerTaskStat {
  taskId: number
  name: string
  avgLatency: number
  loss: number
}

export const NODE_PING_BAR_COUNT = 10
const FULL_LOSS_EPSILON = 1e-6
const PING_RECORD_REFRESH_INTERVAL_MS = 60_000

interface TaskRecordSummary {
  total: number
  success: number
}

function createEmptyStats(): NodePingStatsState {
  return {
    avgLatency: 0,
    avgLoss: 0,
    avgVolatility: 0,
    history: [],
    hasData: false,
    perTaskStats: [],
  }
}

function average(values: number[]): number {
  if (!values.length)
    return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function getIncludedTaskIds(records: PingRecord[]): Set<number> {
  const summaries = new Map<number, TaskRecordSummary>()

  for (const record of records) {
    const summary = summaries.get(record.task_id) ?? { total: 0, success: 0 }
    summary.total += 1
    if (record.value >= 0) {
      summary.success += 1
    }
    summaries.set(record.task_id, summary)
  }

  const validTaskIds = Array.from(summaries.entries())
    .filter(([, summary]) => summary.total > 0 && summary.success / summary.total > FULL_LOSS_EPSILON)
    .map(([taskId]) => taskId)

  return new Set(validTaskIds)
}

function buildPingHistory(records: PingRecord[]): NodePingHistoryPoint[] {
  const sortedRecords = records
    .map((record) => {
      const timestamp = new Date(record.time).getTime()
      return { ...record, timestamp }
    })
    .filter(record => Number.isFinite(record.timestamp))
    .sort((left, right) => left.timestamp - right.timestamp)

  if (!sortedRecords.length)
    return []

  const firstTime = sortedRecords[0]?.timestamp ?? 0
  const lastTime = sortedRecords.at(-1)?.timestamp ?? firstTime
  const bucketCount = Math.min(NODE_PING_BAR_COUNT, sortedRecords.length)
  const bucketSize = Math.max(1, (lastTime - firstTime) / bucketCount)

  return Array.from({ length: bucketCount }, (_, index) => {
    const startTime = firstTime + bucketSize * index
    const endTime = index === bucketCount - 1 ? lastTime + 1 : startTime + bucketSize
    const bucketRecords = sortedRecords.filter(
      record => record.timestamp >= startTime && record.timestamp < endTime,
    )
    const validLatencyRecords = bucketRecords.filter(record => record.value >= 0)
    const lostCount = bucketRecords.length - validLatencyRecords.length
    const latency = validLatencyRecords.length
      ? average(validLatencyRecords.map(record => record.value))
      : null
    const loss = bucketRecords.length
      ? (lostCount / bucketRecords.length) * 100
      : null

    return {
      time: new Date(startTime).toISOString(),
      latency,
      loss,
    }
  })
}

function getPercentile(values: number[], percentile: number): number | null {
  if (!values.length)
    return null

  const sorted = [...values].sort((left, right) => left - right)
  const position = Math.min(sorted.length - 1, Math.max(0, (sorted.length - 1) * percentile))
  const lowerIndex = Math.floor(position)
  const upperIndex = Math.ceil(position)
  const lowerValue = sorted[lowerIndex]
  const upperValue = sorted[upperIndex]

  if (lowerValue === undefined || upperValue === undefined)
    return null
  if (lowerIndex === upperIndex)
    return lowerValue

  return lowerValue + (upperValue - lowerValue) * (position - lowerIndex)
}

function buildStats(records: PingRecord[], tasks: PingTaskInfo[]): NodePingStatsState {
  const includedTaskIds = getIncludedTaskIds(records)

  if (!includedTaskIds.size)
    return createEmptyStats()

  const filteredRecords = records.filter(record => includedTaskIds.has(record.task_id))
  const history = buildPingHistory(filteredRecords)
  const taskRecords = new Map<number, PingRecord[]>()

  for (const record of filteredRecords) {
    const currentRecords = taskRecords.get(record.task_id) ?? []
    currentRecords.push(record)
    taskRecords.set(record.task_id, currentRecords)
  }

  const latencyValues: number[] = []
  const taskLossValues: number[] = []
  const volatilityValues: number[] = []

  for (const recordsByTask of taskRecords.values()) {
    const validValues = recordsByTask
      .map(record => record.value)
      .filter((value): value is number => typeof value === 'number' && value >= 0)

    if (validValues.length) {
      latencyValues.push(average(validValues))

      const p25 = getPercentile(validValues, 0.25)
      const p75 = getPercentile(validValues, 0.75)
      if (p25 !== null && p75 !== null) {
        volatilityValues.push(p75 - p25)
      }
    }

    const lostCount = recordsByTask.length - validValues.length
    if (recordsByTask.length) {
      taskLossValues.push((lostCount / recordsByTask.length) * 100)
    }
  }

  const avgLatency = Math.round(average(latencyValues))
  const avgLoss = Math.round(average(taskLossValues))
  const avgVolatility = Math.round(average(volatilityValues))
  const hasData = history.some(point => point.latency !== null)

  const taskNameMap = new Map(tasks.map(task => [task.id, task.name]))
  const taskOrderMap = new Map(tasks.map((task, index) => [task.id, index]))

  const perTaskStats: NodePingPerTaskStat[] = Array.from(taskRecords.entries())
    .map(([taskId, recordsByTask]) => {
      const valid = recordsByTask.filter(r => r.value >= 0).map(r => r.value)
      const lost = recordsByTask.length - valid.length
      return {
        taskId,
        name: taskNameMap.get(taskId) || `探针 #${taskId}`,
        avgLatency: valid.length ? Math.round(average(valid)) : 0,
        loss: recordsByTask.length ? Math.round((lost / recordsByTask.length) * 100) : 0,
      }
    })
    .sort((a, b) => (taskOrderMap.get(a.taskId) ?? 0) - (taskOrderMap.get(b.taskId) ?? 0))

  return {
    avgLatency,
    avgLoss,
    avgVolatility,
    history,
    hasData,
    perTaskStats,
  }
}

interface NodePingEntry {
  data: ReturnType<typeof shallowRef<{ records: PingRecord[], tasks: PingTaskInfo[] } | null>>
  loading: ReturnType<typeof ref<boolean>>
  error: ReturnType<typeof ref<string | null>>
  promise: Promise<void> | null
  lastFetchedAt: number
}

const nodePingCache = new Map<string, NodePingEntry>()

function getNodePingEntry(key: string): NodePingEntry {
  let entry = nodePingCache.get(key)
  if (!entry) {
    entry = {
      data: shallowRef(null),
      loading: ref(false),
      error: ref(null),
      promise: null,
      lastFetchedAt: 0,
    }
    nodePingCache.set(key, entry)
  }
  return entry
}

async function loadNodePingRecords(entry: NodePingEntry, uuid: string, hours: number): Promise<void> {
  if (entry.promise)
    return entry.promise

  entry.loading.value = true
  entry.error.value = null

  entry.promise = (async () => {
    try {
      const res = await getNodeMetrics(uuid, { series: 'ping', hours, points: 60 })
      const pingList = res.ping || []
      const probeNames = res.probes || {}
      const taskIds = [...new Set(pingList.map(p => p.task_id))]
      const tasks: PingTaskInfo[] = taskIds.map(id => ({
        id,
        name: probeNames[String(id)] || `探针 #${id}`,
      }))
      const records: PingRecord[] = pingList.map(p => ({
        client: uuid,
        task_id: p.task_id,
        time: new Date(p.ts * 1000).toISOString(),
        value: p.latency === null ? -1 : p.latency,
      }))

      entry.data.value = { records, tasks }
      entry.lastFetchedAt = Date.now()
    }
    catch (err) {
      entry.error.value = err instanceof Error ? err.message : '获取 Ping 历史失败'
    }
    finally {
      entry.loading.value = false
      entry.promise = null
    }
  })()

  return entry.promise
}

export function useNodePingStats(
  uuid: MaybeRefOrGetter<string>,
  options?: {
    hours?: MaybeRefOrGetter<number>
    enabled?: MaybeRefOrGetter<boolean>
  },
) {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const resolved = computed(() => ({
    uuid: toValue(uuid),
    hours: Math.max(1, Math.floor(toValue(options?.hours) ?? 24)),
    enabled: toValue(options?.enabled) ?? true,
  }))

  const cacheKey = computed(() => `${resolved.value.uuid}_${resolved.value.hours}`)

  const stats = computed<NodePingStatsState>(() => {
    const { uuid: nodeUuid, enabled } = resolved.value
    if (!enabled || !nodeUuid.trim())
      return createEmptyStats()

    const entry = getNodePingEntry(cacheKey.value)
    const state = entry.data.value
    if (!state)
      return createEmptyStats()

    return state.records.length ? buildStats(state.records, state.tasks) : createEmptyStats()
  })

  watch(
    resolved,
    async (next) => {
      const { uuid: nodeUuid, hours, enabled } = next
      if (!enabled || !nodeUuid.trim()) {
        loading.value = false
        error.value = null
        return
      }

      const entry = getNodePingEntry(cacheKey.value)
      const shouldLoad = !entry.data.value
        || Date.now() - entry.lastFetchedAt >= PING_RECORD_REFRESH_INTERVAL_MS

      if (shouldLoad) {
        loading.value = !entry.data.value
        await loadNodePingRecords(entry, nodeUuid, hours)
        loading.value = false
      }
    },
    { immediate: true },
  )

  const perTaskStats = computed<NodePingPerTaskStat[]>(() => stats.value.perTaskStats)

  return {
    stats,
    loading,
    error,
    history: computed(() => stats.value.history),
    avgLatency: computed(() => stats.value.avgLatency),
    avgLoss: computed(() => stats.value.avgLoss),
    avgVolatility: computed(() => stats.value.avgVolatility),
    perTaskStats,
    hasData: computed(() => stats.value.hasData),
  }
}
