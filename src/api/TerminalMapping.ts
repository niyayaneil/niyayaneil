import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/TerminalMapping'
// 查询分页
export const getTerminalMappingPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/terminalMappings', 'GET', data)
// 新增
export const addTerminalMappingApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/terminalMappings', 'POST', data)
// 编辑
export const editTerminalMappingApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/terminalMappings/${data.id}`, 'PUT', data)
// patch接口
export const patchTerminalMappingApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/terminalMappings/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')
