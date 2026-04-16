import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/SVManagement'
// 查询分页
export const getSVManagementPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/carrierServices', 'GET', data)
// 新增
export const addSVManagementApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/carrierServices', 'POST', data)
// 批量导入
export const batchImportSVManagementApi = (data: BillItemSearchResultItem[]) =>
  request<BillItemSearchResult>('/mgr/carrierServices/saveAll', 'POST', data)
// 编辑
export const editSVManagementApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/carrierServices/${data.id}`, 'PUT', data)
// patch接口
export const patchSVManagementApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/carrierServices/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')
