import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/BasePortTT'
// 查询分页
export const getBasePortTTPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/globalBaseTTs', 'GET', data)
// 新增
export const addBasePortTTApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/globalBaseTTs', 'POST', data)
// 编辑
export const editBasePortTTApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/globalBaseTTs/${data.id}`, 'PUT', data)
// patch接口
export const patchBasePortTTApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/globalBaseTTs/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')
