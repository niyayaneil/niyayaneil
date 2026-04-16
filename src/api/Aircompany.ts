import { request } from '@/utils/request'
import type { AircompanyItem, AircompanySearchParams, AircompanyResponse } from '@/types/Aircompany'

export const getAircompanyList = (params: AircompanySearchParams) => {
  return request<AircompanyResponse>('/mgr/airCompanies/page', 'post', params)
}

// 新增
export const addAircompanyApi = (data: AircompanyItem) => {
  return request<AircompanyResponse>('/mgr/airCompanies', 'post', data)
}

// 编辑
export const editAircompanyApi = (data: AircompanyItem) => {
  return request<AircompanyResponse>(`/mgr/airCompanies/${data.id}`, 'put', data)
}

// 状态更新（启用/禁用）
export const patchAircompanyValidApi = (id: number, isValid: number) => {
  return request<AircompanyResponse>(`/mgr/airCompanies/${id}/valid?isValid=${isValid}`, 'patch')
}