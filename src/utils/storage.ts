/**
 * 安全的 localStorage 访问封装
 * 兼容浏览器禁用站点数据时抛出 SecurityError 的情况，自动降级至内存存储，防止页面白屏
 */

const memoryStore = new Map<string, string>()

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined') {
        const val = window.localStorage?.getItem(key)
        if (val !== undefined)
          return val
      }
    }
    catch {
      // 浏览器禁用存储时抛出 SecurityError，降级到内存
    }
    return memoryStore.get(key) ?? null
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem(key, value)
        return
      }
    }
    catch {
      // 写入失败或被拦截时降级到内存
    }
    memoryStore.set(key, value)
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem(key)
      }
    }
    catch {
      // 忽略移除失败
    }
    memoryStore.delete(key)
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.clear()
      }
    }
    catch {
      // 忽略清空失败
    }
    memoryStore.clear()
  },
}
