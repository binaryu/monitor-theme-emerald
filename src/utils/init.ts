/**
 * 应用初始化与 WebSocket 实时数据管理
 * 适配 monitor-probe 架构：
 * 1. 连 /api/ws?gzip 支持 gzip 二进制帧与纯文本帧
 * 2. 匿名 /api/ws 503 或断开时，启动 /api/nodes 轮询保底并定时尝试重连
 * 3. 页面隐藏时断开推送、停止轮询、丢弃在途请求；回到前台立即拉一次 /api/nodes 并重连
 */

import { useAppStore } from '@/stores/app'
import { useNodesStore } from '@/stores/nodes'
import { getMe, getNodes, loadThemeConfig, safeNodes } from '@/utils/api'

async function decompressGzip(data: ArrayBuffer): Promise<string> {
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const stream = new Response(data).body?.pipeThrough(new DecompressionStream('gzip'))
      if (stream) {
        return await new Response(stream).text()
      }
    }
    catch (err) {
      console.warn('[InitManager] DecompressionStream failed, fallback to text decode:', err)
    }
  }
  return new TextDecoder().decode(data)
}

class InitManager {
  private appStore: ReturnType<typeof useAppStore>
  private nodesStore: ReturnType<typeof useNodesStore>
  private socket: WebSocket | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private abortController: AbortController | null = null
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

    // 监听前后台切换
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
    }

    try {
      this.abortController = new AbortController()

      // 1. 并行请求 /api/me、/api/nodes 与主题设置
      const [meRes, themeConfig, nodesRes] = await Promise.all([
        getMe(this.abortController.signal).catch(() => ({
          site_name: 'Monitor',
          sitename: 'Monitor',
          authed: false,
          public_page: true,
          history_days: 7,
        })),
        loadThemeConfig().catch(() => ({})),
        getNodes(this.abortController.signal).catch((e: unknown) => {
          if (e instanceof DOMException && e.name === 'AbortError')
            return { nodes: [] }
          console.error('[InitManager] Failed to fetch initial nodes:', e)
          return { nodes: [] }
        }),
      ])

      const resolvedSitename = meRes.site_name || meRes.sitename || 'Monitor'
      const isPublic = meRes.public_page ?? meRes.public ?? true

      // 2. 更新系统状态和配置
      this.appStore.updateLoginState(meRes.authed)
      this.appStore.publicSettings = {
        sitename: resolvedSitename,
        authed: meRes.authed,
        public: isPublic,
        history_days: meRes.history_days,
        theme_settings: themeConfig,
      }

      // 更新网页标题
      if (resolvedSitename) {
        document.title = resolvedSitename
      }

      // 3. 填充初始节点数据
      if (nodesRes && Array.isArray(nodesRes.nodes)) {
        const safe = safeNodes(nodesRes.nodes)
        this.nodesStore.setNodesFromMonitor(safe)
      }

      // 4. 若当前处于前台，建立 WebSocket 实时推送
      if (typeof document === 'undefined' || !document.hidden) {
        this.connectWebSocket()
      }

      this.isInitialized = true
    }
    catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error('[InitManager] Init error:', err)
        this.appStore.connectionError = true
      }
    }
    finally {
      this.appStore.loading = false
    }
  }

  /**
   * 启动 WebSocket 连接
   * 使用 /api/ws?gzip 接收 gzip 压缩帧或文本帧
   */
  private connectWebSocket(): void {
    if (this.isDestroyed || (typeof document !== 'undefined' && document.hidden))
      return

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const wsUrl = `${protocol}://${location.host}/api/ws?gzip`

    this.nodesStore.updateWsState('connecting')

    try {
      this.socket = new WebSocket(wsUrl)
      this.socket.binaryType = 'arraybuffer'
    }
    catch {
      // 创建连接失败（如网络离线），启动保底轮询并计划重连
      this.startPolling()
      this.scheduleReconnect()
      return
    }

    this.socket.onopen = () => {
      this.nodesStore.updateWsState('connected', 0)
      this.appStore.connectionError = false
      // WebSocket 连接成功，停止保底轮询和重连定时器
      this.stopPolling()
      this.clearReconnectTimer()
    }

    this.socket.onmessage = async (event: MessageEvent) => {
      try {
        let rawText = ''
        if (typeof event.data === 'string') {
          rawText = event.data
        }
        else if (event.data instanceof ArrayBuffer) {
          rawText = await decompressGzip(event.data)
        }
        else if (event.data instanceof Blob) {
          const buf = await event.data.arrayBuffer()
          rawText = await decompressGzip(buf)
        }

        if (!rawText)
          return

        const data = JSON.parse(rawText)
        if (data && Array.isArray(data.nodes)) {
          const safe = safeNodes(data.nodes)
          this.nodesStore.setNodesFromMonitor(safe)
          this.appStore.connectionError = false
        }
      }
      catch (e) {
        console.error('[InitManager] Failed to handle ws message:', e)
      }
    }

    this.socket.onerror = () => {
      this.socket?.close()
    }

    this.socket.onclose = () => {
      this.socket = null
      if (this.isDestroyed || (typeof document !== 'undefined' && document.hidden))
        return

      this.nodesStore.updateWsState('disconnected')
      // 503 满额握手失败或断开连接时，启动 /api/nodes 轮询保底并定期尝试重连
      this.startPolling()
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.isDestroyed || (typeof document !== 'undefined' && document.hidden) || this.reconnectTimer)
      return

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (!this.isDestroyed && (typeof document === 'undefined' || !document.hidden)) {
        this.connectWebSocket()
      }
    }, 10000)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * 启动保底轮询（每 5 秒拉取一次）
   */
  private startPolling(): void {
    if (this.pollTimer)
      return

    // 立即拉取一次
    this.pollOnce()

    this.pollTimer = setInterval(() => {
      this.pollOnce()
    }, 5000)
  }

  private async pollOnce(): Promise<void> {
    if (this.isDestroyed || (typeof document !== 'undefined' && document.hidden))
      return

    try {
      const signal = this.abortController?.signal
      const res = await getNodes(signal)
      if (this.isDestroyed || (typeof document !== 'undefined' && document.hidden))
        return

      if (res && Array.isArray(res.nodes)) {
        const safe = safeNodes(res.nodes)
        this.nodesStore.setNodesFromMonitor(safe)
        this.appStore.connectionError = false
      }
    }
    catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        // 网络错误继续保持重试
      }
    }
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  private closeWebSocket(): void {
    if (this.socket) {
      const ws = this.socket
      this.socket = null
      ws.onopen = null
      ws.onmessage = null
      ws.onerror = null
      ws.onclose = null
      ws.close()
    }
    this.nodesStore.updateWsState('disconnected')
  }

  private abortInFlight(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  /**
   * 页面切入切出事件处理
   */
  private handleVisibilityChange = (): void => {
    if (this.isDestroyed)
      return

    if (document.hidden) {
      // 页面隐藏时：断开推送、停止轮询、丢弃在途请求
      this.closeWebSocket()
      this.stopPolling()
      this.clearReconnectTimer()
      this.abortInFlight()
    }
    else {
      // 切回前台：立即拉一次 /api/nodes 并重连
      this.abortController = new AbortController()
      this.pollOnce()
      this.connectWebSocket()
    }
  }

  destroy(): void {
    this.isDestroyed = true
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    }
    this.stopPolling()
    this.clearReconnectTimer()
    this.closeWebSocket()
    this.abortInFlight()
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
