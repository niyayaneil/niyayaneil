import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult
} from '@/types/SourceManagement'
// 查询分页
export const getSourceManagementPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/dictSources', 'GET', data)
