const HTTPS_ICON_REGEX = /^https:\/\/[^\s\\]+$/i
const SITE_PATH_ICON_REGEX = /^\/(?!\/)/
const INVALID_PATH_CHARS_REGEX = /[\s\\]/

/**
 * 校验主题设置里的站点图标地址。
 * 允许：以单个 / 开头的站内路径、https 外部地址；其余（含 http、//、data:）一律忽略，
 * 由调用方回退到 /favicon.svg 和内置图标。
 */
export function resolveSiteIconSetting(value: unknown): string {
  if (typeof value !== 'string')
    return ''

  const raw = value.trim()
  if (!raw)
    return ''

  if (SITE_PATH_ICON_REGEX.test(raw))
    return INVALID_PATH_CHARS_REGEX.test(raw) ? '' : raw

  return HTTPS_ICON_REGEX.test(raw) ? raw : ''
}
