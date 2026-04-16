import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/SVMapping'
// 查询分页
export const getSVMappingPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/carrierServiceMappings', 'GET', data)
// 新增
export const addSVMappingApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/carrierServiceMappings', 'POST', data)
// 编辑
export const editSVMappingApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/carrierServiceMappings/${data.id}`, 'PUT', data)
// patch接口
export const patchSVMappingApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/carrierServiceMappings/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')

