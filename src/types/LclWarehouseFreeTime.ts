export interface LclWarehouseFreeTimeItem {
  id: number
  warehouseCode: string
  portCode: string
  serviceProvider: string
  freeDays: number
  freeUnit: string
  remarks: string
  createTime: string
  createUser: string
  updateTime: string
  updateUser: string
  isValid: number
}

export interface LclWarehouseFreeTimeSearchParams {
  pageNum: number
  pageSize: number
  warehouseCode?: string
  portCode?: string
  serviceProvider?: string
  isValid?: number
}

export interface LclWarehouseFreeTimeResponse {
  code: number
  msg: string
  data: {
    list: LclWarehouseFreeTimeItem[]
    pageCount: number
    pageNum: number
    pageSize: number
    total: number
  }
}
