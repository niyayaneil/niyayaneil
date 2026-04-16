import { request } from '@/utils/request'
import type { TruckcompanyItem, TruckcompanySearchParams, TruckcompanyResponse } from '@/types/Truckcompany'

export const getTruckcompanyList = (params: TruckcompanySearchParams) => {
  return request<TruckcompanyResponse>('/mgr/truckCompanies/page', 'post', params)
}

// 新增
export const addTruckcompanyApi = (data: TruckcompanyItem) => {
  return request<TruckcompanyResponse>('/mgr/truckCompanies', 'post', data)
}

// 编辑
export const editTruckcompanyApi = (data: TruckcompanyItem) => {
  return request<TruckcompanyResponse>(`/mgr/truckCompanies/${data.id}`, 'put', data)
}

// 状态更新（启用/禁用）
export const patchTruckcompanyValidApi = (id: number, isValid: number) => {
  return request<TruckcompanyResponse>(`/mgr/truckCompanies/${id}/valid?isValid=${isValid}`, 'patch')
}
