<script setup>
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores'
const { clientName } = storeToRefs(useUserStore())
import { useRouter } from 'vue-router'
const router = useRouter()
const currentRoute = computed(() => router.currentRoute.value)
// const { locale } = useI18n()
// 退出登录方法
const logout = () => {
  window.localStorage.clear()
  window.location.href = '/login-center'
}
const routeTitle = computed(() => currentRoute.value.meta.title)
const routeParTitle = computed(() => currentRoute.value.meta.parTitle)
// 项目跳转
const handleCommand = (command) => {
  window.location.href = window.location.origin + command
}
</script>

<template>
  <div class="flex justify-between items-center w-full pl-[32px] pr-[24px] pt-[8px] pb-[8px]">
    <div class="flex items-center">
      <div>
        <el-dropdown class="flex items-center cursor-pointer" @command="handleCommand">
          <span class="el-dropdown-link">
            数据字典
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="/ratecenter-web">运价中心</el-dropdown-item>
              <el-dropdown-item command="/shipping-schedule-web">船期中心</el-dropdown-item>
              <el-dropdown-item command="/cargo-tracking-web">货物追踪</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="ml-[32px] text-[#999999]">{{ routeParTitle }}</div>
      <div class="mx-[8px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.78813 3.34378C4.95532 3.16933 5.23226 3.16343 5.40671 3.33062L8.90671 6.68478C8.99282 6.7673 9.0415 6.88139 9.0415 7.00065C9.0415 7.11991 8.99282 7.234 8.90671 7.31652L5.40671 10.6707C5.23226 10.8379 4.95532 10.832 4.78814 10.6575C4.62095 10.4831 4.62685 10.2061 4.8013 10.0389L7.97169 7.00065L4.8013 3.96235C4.62685 3.79517 4.62095 3.51823 4.78813 3.34378Z"
            fill="#909399"
          />
        </svg>
      </div>
      <div class="text-[#405262]">{{ routeTitle }}</div>
    </div>
    <div class="flex items-center text-[var(--icon-subtle)]">
      <div class="m-[6px] w-[auto] flex items-center">
        <img src="../../../assets/navbar/username.png" alt="" />
        <div class="ml-[8px]">{{ clientName }}</div>
      </div>
      <div class="cursor-pointer m-[8px]" @click="logout">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.49988 1.5C8.49988 1.16667 8.33321 1 7.99988 1C7.66654 1 7.49988 1.16667 7.49988 1.5V6.5C7.49988 6.83333 7.66654 7 7.99988 7C8.33321 7 8.49988 6.83333 8.49988 6.5V1.5ZM5.49994 3.60005V2.49805C4.11163 3.0752 2.96633 4.11579 2.25911 5.44258C1.55189 6.76937 1.3265 8.30029 1.62131 9.77461C1.91613 11.2489 2.71292 12.5754 3.87598 13.5282C5.03904 14.481 6.49644 15.0012 7.99994 15C9.50218 14.9988 10.9577 14.4775 12.119 13.5246C13.2804 12.5717 14.076 11.2461 14.3705 9.773C14.6651 8.29992 14.4405 6.77028 13.7349 5.44405C13.0293 4.11783 11.8862 3.07686 10.4999 2.49805V3.60005C11.6001 4.16146 12.4792 5.07683 12.9958 6.19873C13.5124 7.32063 13.6363 8.58375 13.3476 9.78464C13.0589 10.9855 12.3744 12.0543 11.4043 12.8188C10.4342 13.5833 9.23505 13.999 7.99994 13.999C6.76483 13.999 5.56566 13.5833 4.59559 12.8188C3.62552 12.0543 2.94101 10.9855 2.6523 9.78464C2.3636 8.58375 2.48751 7.32063 3.00407 6.19873C3.52064 5.07683 4.39979 4.16146 5.49994 3.60005Z"
            fill="#F53F3F"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
