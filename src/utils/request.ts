import { useUserStore } from '@/stores'
import { storeToRefs } from 'pinia'
const { clientName } = storeToRefs(useUserStore())
// import router from '@/router'
import axios, { type Method, type ResponseType } from 'axios'
import { ElMessage } from 'element-plus'

// 1. 新axios实例，基础配置
const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL,  // ← 修改这一行
  timeout: 60000
})
// 2. 请求拦截器，携带token
instance.interceptors.request.use(
  (config) => {
    if (config.headers) {
      let token
      if (localStorage.getItem("userData")) {
        const clientID = import.meta.env.VITE_CLIENT_ID
        const newArr = JSON.parse(localStorage.getItem('userData') as any)
        const newObj = newArr[clientID]
        token = newObj.token;
      }
      config.headers['Authorization'] = `Bearer ${token}`
      config.headers['Username'] = clientName.value
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 3. 响应拦截器，剥离无效数据，401拦截
instance.interceptors.response.use(
  (res) => {
    // 后台约定，响应成功，但是code不是0，是业务逻辑失败,但是提示要有，所以注释放过此方法
    if (
      res.request.responseType === 'blob' ||
      res.request.responseType === 'arraybuffer'
    ) {
      return res
    }
    if (res.data?.code === 200) {
      return res.data
    } else if (res.data?.code === 401) {
      window.location.href = '/login-center'
    } else {
      ElMessage.info(res.data.msg)
      return Promise.reject(res.data.msg)
    }

  },
  (err) => {
    if (err.response?.status === 401) {
      // 删除用户信息
      const store = useUserStore()
      store.delUser()

      window.location.href = '/login-center'
    }
    return Promise.reject(err)
  }
)


type Data<T> = {
  code: number
  message: string
  data: T
}
// 4. 请求工具函数
const request = <T>(url: string, method: Method = 'get', submitData?: object, config?: any) => {
  return instance.request<T, Data<T>>({
    url,
    method,
    [method.toLowerCase() === 'get' ? 'params' : 'data']: submitData,
    responseType: (config?.responseType || 'json') as ResponseType,
    ...config
  })
}

export { request }