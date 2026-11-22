<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue'
import { cn } from '@/lib/utils'

type DataTooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
type DataTooltipTouchTrigger = 'none' | 'tap'

interface Props {
  /** 提示文本，留空且无 #content 插槽时不渲染气泡 */
  content?: string
  /** 气泡相对触发元素的方位 */
  placement?: DataTooltipPlacement
  /** 禁用提示气泡与交互 */
  disabled?: boolean
  /** 触屏端交互方式：none 仅桌面悬停且穿透点击，tap 允许点击展开（用于独立信息按钮） */
  touchTrigger?: DataTooltipTouchTrigger
  /** 气泡宽度，number 视为 px；默认由内容撑起 */
  width?: number | string
  /** 气泡高度，number 视为 px；默认由内容撑起 */
  height?: number | string
  /** 包裹元素标签，默认 div */
  as?: string
  /** 包裹元素的附加类 */
  class?: HTMLAttributes['class']
  /** 气泡的附加类 */
  contentClass?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  disabled: false,
  touchTrigger: 'none',
  as: 'div',
})
const slots = useSlots()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const isHoverOpen = ref(false)
let lastTouchPointerUpAt = 0

const hasTooltip = computed(() => !props.disabled && Boolean(props.content || slots.content))

const placementClass: Record<DataTooltipPlacement, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left: 'top-1/2 right-full mr-2 -translate-y-1/2',
  right: 'top-1/2 left-full ml-2 -translate-y-1/2',
}

const sizeStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width != null)
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  if (props.height != null)
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  return style
})

function isTouchLikePointer(event: PointerEvent) {
  const hasCoarsePointer = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(hover: none), (pointer: coarse)').matches

  return event.pointerType !== 'mouse' || hasCoarsePointer
}

function closeTooltip() {
  isOpen.value = false
  isHoverOpen.value = false
}

function removeDocumentListeners() {
  if (typeof document === 'undefined')
    return

  document.removeEventListener('pointerdown', handleDocumentPointerDown, true)
  document.removeEventListener('keydown', handleDocumentKeydown)
}

function handleDocumentPointerDown(event: PointerEvent) {
  const root = rootRef.value
  if (!root || !event.target || root.contains(event.target as Node))
    return

  closeTooltip()
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    closeTooltip()
}

function handlePointerDown(event: PointerEvent) {
  if (!isTouchLikePointer(event))
    lastTouchPointerUpAt = 0
}

function handlePointerUp(event: PointerEvent) {
  if (!hasTooltip.value || props.touchTrigger !== 'tap')
    return

  if (isTouchLikePointer(event))
    lastTouchPointerUpAt = Date.now()
  else
    lastTouchPointerUpAt = 0
}

function handlePointerCancel() {
  lastTouchPointerUpAt = 0
}

function handleClickCapture(event: MouseEvent) {
  if (!hasTooltip.value || props.touchTrigger !== 'tap')
    return

  const isRecentTouchTap = lastTouchPointerUpAt > 0 && Date.now() - lastTouchPointerUpAt < 800
  lastTouchPointerUpAt = 0

  if (!isRecentTouchTap)
    return

  event.stopPropagation()
  isOpen.value = !isOpen.value
}

function openHoverTooltip(event: PointerEvent) {
  if (!hasTooltip.value || isTouchLikePointer(event))
    return

  isHoverOpen.value = true
}

function openFocusTooltip(event: FocusEvent) {
  if (!hasTooltip.value)
    return

  const target = event.target instanceof HTMLElement ? event.target : null
  if (target && !target.matches(':focus-visible'))
    return

  isHoverOpen.value = true
}

function closeHoverTooltip() {
  isHoverOpen.value = false
}

watch(isOpen, (open) => {
  if (typeof document === 'undefined')
    return

  if (open) {
    document.addEventListener('pointerdown', handleDocumentPointerDown, true)
    document.addEventListener('keydown', handleDocumentKeydown)
    return
  }

  removeDocumentListeners()
})

watch(hasTooltip, (value) => {
  if (!value)
    closeTooltip()
})

watch(() => props.touchTrigger, (trigger) => {
  if (trigger === 'none')
    isOpen.value = false
})

onBeforeUnmount(removeDocumentListeners)
</script>

<template>
  <component
    :is="as"
    ref="rootRef"
    data-slot="data-tooltip"
    :data-state="isOpen ? 'open' : 'closed'"
    :class="cn('group/data-tooltip relative inline-block', props.class)"
    @pointerdown.capture="handlePointerDown"
    @pointerup.capture="handlePointerUp"
    @pointercancel.capture="handlePointerCancel"
    @pointerenter="openHoverTooltip"
    @pointerleave="closeHoverTooltip"
    @focusin="openFocusTooltip"
    @focusout="closeHoverTooltip"
    @click.capture="handleClickCapture"
  >
    <slot />
    <span
      v-if="hasTooltip && (isOpen || isHoverOpen)"
      role="tooltip"
      :class="cn(
        'pointer-events-none absolute z-20 block rounded bg-foreground/80 p-1 text-[10px] leading-none text-background shadow-lg whitespace-normal break-words',
        placementClass[placement],
        props.contentClass,
      )"
      :style="sizeStyle"
    >
      <slot name="content">{{ content }}</slot>
    </span>
  </component>
</template>
