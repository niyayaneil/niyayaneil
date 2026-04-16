import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/Country'
// 查询分页
export const getCountryPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/dictCountries', 'GET', data)
// 新增
export const addCountryApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/dictCountries', 'POST', data)
// 编辑
export const editCountryApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/dictCountries/${data.id}`, 'PUT', data)
// patch接口
export const patchCountryApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/dictCountries/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')

