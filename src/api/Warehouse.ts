import { request } from '@/utils/request'
import type { WarehouseItem, WarehouseSearchParams, WarehouseResponse } from '@/types/Warehouse'

export const getWarehouseList = (params: WarehouseSearchParams) => {
  return request<WarehouseResponse>('/mgr/warehouses/page', 'post', params)
}

// 新增
export const addWarehouseApi = (data: WarehouseItem) => {
  return request<WarehouseResponse>('/mgr/warehouses', 'post', data)
}

// 编辑
export const editWarehouseApi = (data: WarehouseItem) => {
  return request<WarehouseResponse>(`/mgr/warehouses/${data.id}`, 'put', data)
}

// 状态更新（启用/禁用）
export const patchWarehouseValidApi = (id: number, isValid: number) => {
  return request<WarehouseResponse>(`/mgr/warehouses/${id}/valid?isValid=${isValid}`, 'patch')
}
