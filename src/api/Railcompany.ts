import { request } from '@/utils/request'

interface RailcompanySearchParams {
  pageNum: number
  pageSize: number
  railroadCode?: string
  railroadNameEn?: string
  railroadNameCn?: string
  partnerCarriers?: string
  isValid?: number
}

export interface RailcompanyItem {
  id: number
  railroadCode: string
  railroadNameEn: string
  railroadNameCn: string
  partnerCarriers: string
  description: string
  isValid: number
  createTime: string
  updateTime: string
  createUser: string
  updateUser: string
}

export interface RailcompanyResponse {
  code: number
  msg: string
  data: {
    list: RailcompanyItem[]
    total: number
    pageSize: number
    current: number
    pages: number
  }
}

export const getRailcompanyList = (params: RailcompanySearchParams) => {
  return request('/mgr/railCompanies/page', 'post', params)
}

// 新增
export const addRailcompanyApi = (data: RailcompanyItem) => {
  return request('/mgr/railCompanies', 'post', data)
}

// 编辑
export const editRailcompanyApi = (data: RailcompanyItem) => {
  return request(`/mgr/railCompanies/${data.id}`, 'put', data)
}

// 状态更新（启用/禁用）
export const patchRailcompanyValidApi = (id: number, isValid: number) => {
  return request(`/mgr/railCompanies/${id}/valid?isValid=${isValid}`, 'patch')
}
