import { request } from '@/utils/request'
import type { TruckcompanyItem, TruckcompanySearchParams, TruckcompanyResponse } from '@/types/Truckcompany'

export const getTruckcompanyList = (params: TruckcompanySearchParams) => {
  return request<TruckcompanyResponse>('/mgr/truckCompanies/page', 'post', params)
}

export const createTruckcompany = (data: Omit<TruckcompanyItem, 'id' | 'createTime' | 'createUser' | 'updateTime' | 'updateUser'>) => {
  return request<{ code: number; msg: string }>('/mgr/truckCompanies', 'post', data)
}

export const getTruckcompanyDetail = (id: number) => {
  return request<TruckcompanyItem>(`/mgr/truckCompanies/${id}`, 'get')
}

export const updateTruckcompany = (id: number, data: Omit<TruckcompanyItem, 'id' | 'createTime' | 'createUser' | 'updateTime' | 'updateUser'>) => {
  return request<{ code: number; msg: string }>(`/mgr/truckCompanies/${id}`, 'put', data)
}

export const deleteTruckcompany = (id: number) => {
  return request<{ code: number; msg: string }>(`/mgr/truckCompanies/${id}`, 'delete')
}

export const updateTruckcompanyStatus = (id: number, isValid: number) => {
  return request<{ code: number; msg: string }>(`/mgr/truckCompanies/${id}/valid?isValid=${isValid}`, 'patch')
}
