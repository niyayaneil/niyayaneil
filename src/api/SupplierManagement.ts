import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/SupplierManagement'
// 查询分页
export const getSupplierManagementPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/suppliers', 'GET', data)
// 新增
export const addSupplierManagementApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/suppliers', 'POST', data)
// 编辑
export const editSupplierManagementApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/suppliers/${data.id}`, 'PUT', data)
// patch接口
export const patchSupplierManagementApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/suppliers/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')

