import { request } from '@/utils/request'
import type { FclOriginChargeItem, FclOriginChargeSearchParams, FclOriginChargeResponse } from '@/types/FclOriginCharge'

// 获取FCL起运港费用列表
export const getFclOriginChargeList = (params: FclOriginChargeSearchParams) => {
  return request<FclOriginChargeResponse>('/mgr/fclOriginCharge/page', 'post', params)
}

// 新增FCL起运港费用
export const addFclOriginChargeApi = (data: FclOriginChargeItem) => {
  return request<FclOriginChargeResponse>('/mgr/fclOriginCharge', 'post', data)
}

// 编辑FCL起运港费用
export const editFclOriginChargeApi = (data: FclOriginChargeItem) => {
  return request<FclOriginChargeResponse>(`/mgr/fclOriginCharge/${data.id}`, 'put', data)
}

// 状态更新（启用/禁用）
export const patchFclOriginChargeValidApi = (id: number, isValid: number) => {
  return request<FclOriginChargeResponse>(`/mgr/fclOriginCharge/${id}/valid?isValid=${isValid}`, 'patch')
}