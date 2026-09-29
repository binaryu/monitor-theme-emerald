/**
 * 应用初始化与 WebSocket 实时数据管理
 * 适配 monitor-probe 架构
 */

import { useAppStore } from '@/stores/app'
import { useNodesStore } from '@/stores/nodes'
import { getMe, getNodes, loadThemeConfig, safeNodes } from '@/utils/api'

class InitManager {
  private appStore: ReturnType<typeof useAppStore>
  private nodesStore: ReturnType<typeof useNodesStore>
  private socket: WebSocket | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private isInitialized = false
  private isDestroyed = false

  constructor() {
    this.appStore = useAppStore()
    this.nodesStore = useNodesStore()
  }

  async init(): Promise<void> {
    if (this.isInitialized)
      return

    this.isDestroyed = false

    try {
      // 1. 并行请求 /api/me、/api/nodes 与主题设置
      const [meRes, themeConfig, nodesRes] = await Promise.all([
        getMe().catch(() => ({ sitename: 'Status', authed: false, public: true })),
        loadThemeConfig().catch(() => ({})),
        getNodes().catch((e) => {
          console.error('[InitManager] Failed to fetch initial nodes:', e)
          return { nodes: [] }
        }),
      ])

      // 2. 更新系统状态和配置
      this.appStore.updateLoginState(meRes.authed)
      this.appStore.publicSettings = {
        sitename: meRes.sitename,
        authed: meRes.authed,
        public: meRes.public,
        theme_settings: themeConfig,
      }

      // 更新网页标题
      if (meRes.sitename) {
        document.title = meRes.sitename
      }

      // 3. 填充初始节点数据
      if (nodesRes && Array.isArray(nodesRes.nodes)) {
        const safe = safeNodes(nodesRes.nodes)
        this.nodesStore.setNodesFromMonitor(safe)
      }

      // 4. 建立 WebSocket 实时推送
      this.connectWebSocket()

      this.isInitialized = true
    }
    catch (err) {
      console.error('[InitManager] Init error:', err)
      this.appStore.connectionError = true
    }
    finally {
      this.appStore.loading = false
    }
  }

  /**
   * 启动 WebSocket 连接
   */
  private connectWebSocket(): void {
    if (this.isDestroyed)
      return

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const wsUrl = `${protocol}://${location.host}/api/ws`

    this.nodesStore.updateWsState('connecting')

    try {
      this.socket = new WebSocket(wsUrl)
    }
    catch {
      this.startPolling()
      this.scheduleReconnect()
      return
    }

    this.socket.onopen = () => {
      this.nodesStore.updateWsState('connected', 0)
      this.appStore.connectionError = false
      // WebSocket 连接成功，停止保底轮询
      this.stopPolling()
      this.clearReconnectTimer()
    }

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data && Array.isArray(data.nodes)) {
          const safe = safeNodes(data.nodes)
          this.nodesStore.setNodesFromMonitor(safe)
        }
      }
      catch (e) {
        console.error('[InitManager] Failed to parse ws message:', e)
      }
    }

    this.socket.onerror = () => {
      this.socket?.close()
    }

    this.socket.onclose = () => {
      if (this.isDestroyed)
        return
      this.nodesStore.updateWsState('disconnected')
      this.startPolling()
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.isDestroyed || this.reconnectTimer)
      return

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (!this.isDestroyed) {
        this.connectWebSocket()
      }
    }, 5000)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private startPolling(): void {
    if (this.pollTimer)
      return

    // 立即拉取一次
    this.pollOnce()

    // 5秒轮询一次保底
    this.pollTimer = setInterval(() => {
      this.pollOnce()
    }, 5000)
  }

  private async pollOnce(): Promise<void> {
    try {
      const res = await getNodes()
      if (res && Array.isArray(res.nodes)) {
        const safe = safeNodes(res.nodes)
        this.nodesStore.setNodesFromMonitor(safe)
        this.appStore.connectionError = false
      }
    }
    catch {
      // 网络错误继续保持重试
    }
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  destroy(): void {
    this.isDestroyed = true
    this.stopPolling()
    this.clearReconnectTimer()
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.nodesStore.updateWsState('disconnected')
    this.isInitialized = false
  }
}

let initManager: InitManager | null = null

export async function initApp(): Promise<void> {
  if (!initManager) {
    initManager = new InitManager()
  }
  await initManager.init()
}

export function destroyInitManager(): void {
  if (initManager) {
    initManager.destroy()
    initManager = null
  }
}
