import { request } from '@/utils/request'
import type { FclOutsideFreeTimeItem, FclOutsideFreeTimeSearchParams, FclOutsideFreeTimeResponse } from '@/types/FclOutsideFreeTime'

// 获取FCL仓库免堆期列表
export const getFclOutsideFreeTimeList = (params: FclOutsideFreeTimeSearchParams) => {
  return request<FclOutsideFreeTimeResponse>('/mgr/fclOutsideFreeTimes/page', 'post', params)
}

// 新增FCL仓库免堆期
export const addFclOutsideFreeTimeApi = (data: FclOutsideFreeTimeItem) => {
  return request<FclOutsideFreeTimeResponse>('/mgr/fclOutsideFreeTimes', 'post', data)
}

// 编辑FCL仓库免堆期
export const editFclOutsideFreeTimeApi = (data: FclOutsideFreeTimeItem) => {
  return request<FclOutsideFreeTimeResponse>(`/mgr/fclOutsideFreeTimes/${data.id}`, 'put', data)
}

// 状态更新（启用/禁用）
export const patchFclOutsideFreeTimeValidApi = (id: number, isValid: number) => {
  return request<FclOutsideFreeTimeResponse>(`/mgr/fclOutsideFreeTimes/${id}/valid?isValid=${isValid}`, 'patch')
}
