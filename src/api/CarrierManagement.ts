import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/CarrierManagement'
// 查询分页
export const getCarrierPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/carrierCompanies', 'GET', data)
// 新增
export const addCarrierApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/carrierCompanies', 'POST', data)
// 编辑
export const editCarrierApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/carrierCompanies/${data.id}`, 'PUT', data)
// patch接口
export const patchCarrierApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/carrierCompanies/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')

