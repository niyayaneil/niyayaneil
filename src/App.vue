<script setup lang="ts">
import { onBeforeMount, onUnmounted } from 'vue'
import { version as versionNumber } from '../public/config/version.json'
import { ElMessageBox } from 'element-plus'
let timer: number | undefined

const checkForUpdates = async () => {
  try {
    const res = await fetch(`config/version.json?random=${Math.random()}`)
    if (!res.ok) {
      window.console.error('Failed to fetch version.json')
      return // 如果请求失败，则跳过刷新操作
    }

    const { version } = await res.json()
    const lastReloadTime = localStorage.getItem('lastReloadintraTime')

    if (
      version !== versionNumber &&
      (!lastReloadTime || Date.now() - parseInt(lastReloadTime) >= 10 * 60 * 1000)
    ) {
      ElMessageBox.alert('网站已发布新版本，请立即刷新!', '提示', {
        confirmButtonText: 'OK',
        callback: () => {
          // 用户选择立即刷新
          localStorage.setItem('lastReloadintraTime', Date.now().toString())
          window.location.reload()
        },
      })
    }
  } catch (error) {
    window.console.error('Error:', error)
  }
}

onBeforeMount(() => {
  checkForUpdates() // 首次加载时调用一次
  timer = window.setInterval(checkForUpdates, 5 * 60 * 1000) // 每5分钟检查一次
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
