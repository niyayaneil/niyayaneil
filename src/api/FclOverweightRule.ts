import { request } from '@/utils/request'
import type { FclOverweightRuleItem, FclOverweightRuleSearchParams, FclOverweightRuleResponse } from '@/types/FclOverweightRule'

export const getFclOverweightRuleList = (params: FclOverweightRuleSearchParams) => {
  return request<FclOverweightRuleResponse>('/mgr/fclOverweightRule/page', 'post', params)
}

export const addFclOverweightRuleApi = (params: Omit<FclOverweightRuleItem, 'id' | 'createTime' | 'createUser' | 'updateTime' | 'updateUser'>) => {
  return request<{ code: number; msg: string; data: any }>('/mgr/fclOverweightRule', 'post', params)
}

export const editFclOverweightRuleApi = (params: FclOverweightRuleItem) => {
  return request<{ code: number; msg: string; data: any }>(`/mgr/fclOverweightRule/${params.id}`, 'put', params)
}

export const patchFclOverweightRuleValidApi = (id: number, isValid: number) => {
  return request<{ code: number; msg: string; data: any }>(`/mgr/fclOverweightRule/${id}/valid`, 'patch', { isValid })
}