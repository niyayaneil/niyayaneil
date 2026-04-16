import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/Port'
// 查询分页
export const getPortPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/globalPorts', 'GET', data)
// 新增
export const addPortApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/globalPorts', 'POST', data)
// 编辑
export const editPortApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/globalPorts/${data.id}`, 'PUT', data)
// patch接口
export const patchPortApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/globalPorts/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')
