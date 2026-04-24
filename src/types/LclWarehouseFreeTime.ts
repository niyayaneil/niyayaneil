export interface LclWarehouseFreeTimeItem {
  id: number
  warehouseCode: string
  portCode: string
  serviceProvider: string
  freeDays: number | undefined
  freeUnit: string
  remarks: string
  validFrom: string
  validTo: string
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
  validFrom?: string
  validTo?: string
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
