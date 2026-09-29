/**
 * Ping 任务排序：与主控 GetAllPingTasks 一致（weight ASC, id ASC）。
 * 顺序来源：public:getPublicPingTasks（官方主题 MiniPingChart 同款）。
 */

export interface PublicPingTaskOrderItem {
  id: number
  weight?: number
  name?: string
}

/**
 * 比较两个任务在后台配置中的显示顺序。
 * 优先使用 publicTasks 数组下标（接口已按 weight/id 排好）；
 * 否则回退到 weight、再 id。
 */
export function comparePingTaskOrder(
  leftId: number,
  rightId: number,
  publicTasks: ReadonlyArray<PublicPingTaskOrderItem>,
): number {
  if (publicTasks.length) {
    const leftIndex = publicTasks.findIndex(task => task.id === leftId)
    const rightIndex = publicTasks.findIndex(task => task.id === rightId)

    if (leftIndex !== -1 && rightIndex !== -1)
      return leftIndex - rightIndex
    if (leftIndex !== -1)
      return -1
    if (rightIndex !== -1)
      return 1
  }

  const left = publicTasks.find(task => task.id === leftId)
  const right = publicTasks.find(task => task.id === rightId)
  const leftWeight = Number(left?.weight)
  const rightWeight = Number(right?.weight)

  if (Number.isFinite(leftWeight) && Number.isFinite(rightWeight)) {
    const weightDelta = leftWeight - rightWeight
    if (weightDelta !== 0)
      return weightDelta
  }
  else if (Number.isFinite(leftWeight)) {
    return -1
  }
  else if (Number.isFinite(rightWeight)) {
    return 1
  }

  return leftId - rightId
}

/** 按后台配置顺序排序任务列表（稳定排序） */
export function sortTasksByPublicOrder<T extends { id: number }>(
  tasks: ReadonlyArray<T>,
  publicTasks: ReadonlyArray<PublicPingTaskOrderItem>,
): T[] {
  if (!tasks.length)
    return []

  return [...tasks].sort((left, right) =>
    comparePingTaskOrder(left.id, right.id, publicTasks),
  )
}
