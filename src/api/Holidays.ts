import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResultItem,
  BillItemSearchResult,
} from '@/types/Holidays'
// 查询分页
export const getHolidayPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/globalRestDays', 'GET', data)
// 编辑
export const editHolidayApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/globalRestDays/${data.id}`, 'PUT', data)
// 删除
export const deleteHolidayApi = (data: { id: number }) =>
  request<BillItemSearchResult>(`/mgr/globalRestDays/${data.id}`, 'DELETE')
