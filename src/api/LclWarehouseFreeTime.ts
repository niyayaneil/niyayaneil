import { request } from '@/utils/request'
import type { LclWarehouseFreeTimeItem, LclWarehouseFreeTimeSearchParams, LclWarehouseFreeTimeResponse } from '@/types/LclWarehouseFreeTime'

// 获取LCL仓库免堆期列表
export const getLclWarehouseFreeTimeList = (params: LclWarehouseFreeTimeSearchParams) => {
  return request<LclWarehouseFreeTimeResponse>('/mgr/lclWarehouseFreeTimes/page', 'post', params)
}

// 新增LCL仓库免堆期
export const addLclWarehouseFreeTimeApi = (data: LclWarehouseFreeTimeItem) => {
  return request<LclWarehouseFreeTimeResponse>('/mgr/lclWarehouseFreeTimes', 'post', data)
}

// 编辑LCL仓库免堆期
export const editLclWarehouseFreeTimeApi = (data: LclWarehouseFreeTimeItem) => {
  return request<LclWarehouseFreeTimeResponse>(`/mgr/lclWarehouseFreeTimes/${data.id}`, 'put', data)
}

// 状态更新（启用/禁用）
export const patchLclWarehouseFreeTimeValidApi = (id: number, isValid: number) => {
  return request<LclWarehouseFreeTimeResponse>(`/mgr/lclWarehouseFreeTimes/${id}/valid?isValid=${isValid}`, 'patch')
}
