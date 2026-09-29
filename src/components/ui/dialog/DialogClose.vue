<script setup lang="ts">
import type { DialogCloseProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { DialogClose } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogCloseProps & {
  class?: HTMLAttributes['class']
}>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <DialogClose
    v-bind="delegatedProps"
    :class="cn(props.class)"
  >
    <slot />
  </DialogClose>
</template>
