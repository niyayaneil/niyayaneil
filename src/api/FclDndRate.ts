import { request } from '@/utils/request'
import type { FclDndRateItem, FclDndRateSearchParams, FclDndRateResponse } from '@/types/FclDndRate'

// 获取FCL DND费率列表
export const getFclDndRateList = (params: FclDndRateSearchParams) => {
  return request<FclDndRateResponse>('/mgr/fclDndRates/page', 'post', params)
}

// 新增FCL DND费率
export const addFclDndRateApi = (data: FclDndRateItem) => {
  return request<FclDndRateResponse>('/mgr/fclDndRates', 'post', data)
}

// 编辑FCL DND费率
export const editFclDndRateApi = (data: FclDndRateItem) => {
  return request<FclDndRateResponse>(`/mgr/fclDndRates/${data.id}`, 'put', data)
}

// 状态更新（启用/禁用）
export const patchFclDndRateValidApi = (id: number, isValid: number) => {
  return request<FclDndRateResponse>(`/mgr/fclDndRates/${id}/valid?isValid=${isValid}`, 'patch')
}
