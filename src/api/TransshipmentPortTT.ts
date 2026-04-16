import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/TransshipmentPortTT'
// 查询分页
export const getTransshipmentPortTTPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/globalIpiTTs', 'GET', data)
// 新增
export const addTransshipmentPortTTApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/globalIpiTTs', 'POST', data)
// 编辑
export const editTransshipmentPortTTApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/globalIpiTTs/${data.id}`, 'PUT', data)
// patch接口
export const patchTransshipmentPortTTApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/globalIpiTTs/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')
