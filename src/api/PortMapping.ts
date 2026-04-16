import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/PortMapping'
// 查询分页
export const getPortMappingPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/portMappings', 'GET', data)
// 新增
export const addPortMappingApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/portMappings', 'POST', data)
// 编辑
export const editPortMappingApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/portMappings/${data.id}`, 'PUT', data)
// patch接口
export const patchPortMappingApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/portMappings/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')
