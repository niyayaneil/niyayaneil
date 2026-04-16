import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useUserStore = defineStore(
  'cp-user',
  () => {
    // 用户信息
    const token = ref<String>('')
    const clientName = ref<String>('')
    const userInfo = ref<any>({})
    // 设置用户，登录后使用
    const setToken = (u: string) => {
      token.value = u
    }
    const setClientName = (u: string) => {
      clientName.value = u
    }
    const setUser = (u: any) => {
      userInfo.value = u
    }

    // 清空用户，退出后使用
    const delUser = () => {
      token.value = ''
      clientName.value = ''
      userInfo.value = {}
    }

    return {
      token,
      clientName,
      userInfo,
      setUser,
      setToken,
      setClientName,
      delUser,
    }
  },
  {
    persist: true
  }
)

