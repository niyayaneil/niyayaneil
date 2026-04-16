import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/Terminal'
// 查询分页
export const getTerminalPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/globalTerminals', 'GET', data)
// 新增
export const addTerminalApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/globalTerminals', 'POST', data)
// 编辑
export const editTerminalApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/globalTerminals/${data.id}`, 'PUT', data)
// patch接口
export const patchTerminalApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/globalTerminals/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')
