import { request } from '@/utils/request'
import type {
  BillItemSearch,
  BillItemSearchResult,
  BillItemSearchResultItem
} from '@/types/PortAttributes'
// 查询分页
export const getPortAttributesPageApi = (data: BillItemSearch) =>
  request<BillItemSearchResult>('/mgr/globalPortAttriMappings', 'GET', data)
// 新增
export const addPortAttributesApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>('/mgr/globalPortAttriMappings', 'POST', data)
// 批量导入
export const batchImportPortAttributesApi = (data: BillItemSearchResultItem[]) =>
  request<BillItemSearchResult>('/mgr/globalPortAttriMappings/saveAll', 'POST', data)
// 编辑
export const editPortAttributesApi = (data: BillItemSearchResultItem) =>
  request<BillItemSearchResult>(`/mgr/globalPortAttriMappings/${data.id}`, 'PUT', data)
// patch接口
export const patchPortAttributesApi = (data: { id: number, isValid: string }) =>
  request<BillItemSearchResult>(`/mgr/globalPortAttriMappings/${data.id}/valid?isValid=${data.isValid}`, 'PATCH')
