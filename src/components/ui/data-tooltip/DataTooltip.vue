<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue'
import { cn } from '@/lib/utils'

type DataTooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

interface Props {
  /** 提示文本，留空且无 #content 插槽时不渲染气泡 */
  content?: string
  /** 气泡相对触发元素的方位 */
  placement?: DataTooltipPlacement
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
  as: 'div',
})
const slots = useSlots()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const isHoverOpen = ref(false)
let lastTouchOpenAt = 0
let shouldStopNextClick = false

const hasTooltip = computed(() => Boolean(props.content || slots.content))

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
  if (!hasTooltip.value || !isTouchLikePointer(event))
    return

  lastTouchOpenAt = Date.now()
  shouldStopNextClick = true
  isOpen.value = !isOpen.value
}

function handleClick(event: MouseEvent) {
  if (shouldStopNextClick && Date.now() - lastTouchOpenAt < 800)
    event.stopPropagation()

  shouldStopNextClick = false
}

function openHoverTooltip() {
  if (hasTooltip.value)
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
    @pointerenter="openHoverTooltip"
    @pointerleave="closeHoverTooltip"
    @focusin="openHoverTooltip"
    @focusout="closeHoverTooltip"
    @click="handleClick"
  >
    <slot />
    <span
      v-if="hasTooltip && (isOpen || isHoverOpen)"
      role="tooltip"
      :class="cn(
        'pointer-events-none absolute z-20 hidden rounded bg-foreground/80 p-1 text-[10px] leading-none text-background shadow-lg group-hover/data-tooltip:block group-focus-within/data-tooltip:block whitespace-normal break-words',
        isOpen && 'block',
        placementClass[placement],
        props.contentClass,
      )"
      :style="sizeStyle"
    >
      <slot name="content">{{ content }}</slot>
    </span>
  </component>
</template>
