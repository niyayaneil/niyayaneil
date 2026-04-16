import { request } from '@/utils/request'
// 查询分页
export const getOptionsListApi = (data: { [key: string]: any }) =>
  request<{ [key: string]: { label: string, value: string | number }[] }>('/mgr/options', 'POST', data)

// readMes
export const getreadMsgApi = (data: any) =>
  request('/mgr/readMes', 'GET', data)
