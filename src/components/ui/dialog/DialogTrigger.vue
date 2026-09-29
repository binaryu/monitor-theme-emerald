<script setup lang="ts">
import type { DialogTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { DialogTrigger } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogTriggerProps & {
  class?: HTMLAttributes['class']
}>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <DialogTrigger
    v-bind="delegatedProps"
    :class="cn(props.class)"
  >
    <slot />
  </DialogTrigger>
</template>
