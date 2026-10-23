<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, inject, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DataTooltip } from '@/components/ui/data-tooltip'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

const isScrolled = inject<ReturnType<typeof ref<boolean>>>('isScrolled', ref(false))

// hub 返回页面时会把 <link rel="icon" href="/favicon.svg"> 改写成带版本号的地址，
// 页头读它就能跟随面板里上传的站点图标，并且换图标后不会被浏览器缓存卡住
const iconLink = document.querySelector<HTMLLinkElement>('link[rel~=\'icon\']')
const hubFavicon = ref(iconLink?.getAttribute('href') || '/favicon.svg')
const failedIcons = ref<string[]>([])

/** 优先级：主题设置 > hub 站点图标 > /favicon.svg；加载失败的自动跳过 */
const siteFavicon = computed(() => {
  const candidates = [...new Set([appStore.siteIconUrl, hubFavicon.value, '/favicon.svg'])].filter(Boolean)
  return candidates.find(url => !failedIcons.value.includes(url)) ?? ''
})

function markIconFailed() {
  if (siteFavicon.value && !failedIcons.value.includes(siteFavicon.value))
    failedIcons.value = [...failedIcons.value, siteFavicon.value]
}

function handleIconStatus(status: string) {
  if (status === 'error')
    markIconFailed()
}

// 标签页图标跟着最终生效的地址走（主题设置、或回退后的地址）
watchEffect(() => {
  if (iconLink && siteFavicon.value && iconLink.getAttribute('href') !== siteFavicon.value)
    iconLink.href = siteFavicon.value
})

const actionButtons = computed(() => {
  const buttons = [
    {
      title: appStore.themeMode === 'auto' ? '自动主题' : appStore.themeMode === 'light' ? '浅色主题' : '深色主题',
      icon: appStore.themeMode === 'auto' ? 'icon-park-outline:dark-mode' : appStore.themeMode === 'light' ? 'icon-park-outline:sun-one' : 'icon-park-outline:moon',
      action: 'toggleTheme',
    },
  ]

  if (appStore.isLoggedIn || !appStore.hideAdminEntryWhenLoggedOut) {
    buttons.push({
      title: '后台管理',
      icon: 'icon-park-outline:setting',
      action: 'jumpToSetting',
    })
  }
  return buttons
})

function handleButtonClick(action: string) {
  switch (action) {
    case 'toggleTheme':
      appStore.updateThemeMode()
      break
    case 'jumpToSetting':
      location.href = '/admin'
      break
  }
}

const sitename = computed(() => appStore.publicSettings?.sitename || 'Monitor')
</script>

<template>
  <div
    class="transition-all duration-200 top-0 sticky z-10 border-b border-transparent"
    :class="isScrolled ? 'backdrop-blur-xl' : 'bg-transparent'"
  >
    <div class="px-4 flex-between h-14 max-w-[1280px] mx-auto">
      <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
        <div v-if="!siteFavicon" class="size-8 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            class="size-6 fill-foreground"
          >
            <rect x="4" y="18" width="5" height="10" rx="1.5" />
            <rect x="13" y="10" width="5" height="18" rx="1.5" />
            <rect x="22" y="4" width="5" height="24" rx="1.5" />
          </svg>
        </div>
        <Avatar v-else class="size-8">
          <AvatarImage
            :key="siteFavicon" :src="siteFavicon" :alt="sitename"
            @error="markIconFailed" @loading-status-change="handleIconStatus"
          />
          <AvatarFallback>{{ sitename.slice(0, 1) }}</AvatarFallback>
        </Avatar>
        <h3 class="m-0 text-lg font-semibold">
          {{ sitename }}
        </h3>
      </div>
      <div class="flex items-center gap-2">
        <DataTooltip v-for="button in actionButtons" :key="button.action" :content="button.title" placement="left" content-class="whitespace-nowrap text-[11px] px-2">
          <Button variant="ghost" size="icon-sm" @click="handleButtonClick(button.action)">
            <Icon :icon="button.icon" :width="18" :height="18" />
          </Button>
        </DataTooltip>
      </div>
    </div>
  </div>
</template>
