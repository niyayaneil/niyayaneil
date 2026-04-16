import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/ProviceState'
// 查询分页
export const getProviceStatePageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/dictStates', 'GET', data)
// 新增
export const addProviceStateApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/dictStates', 'POST', data)
// 编辑
export const editProviceStateApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/dictStates/${data.id}`, 'PUT', data)
// patch接口
export const patchProviceStateApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/dictStates/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')

