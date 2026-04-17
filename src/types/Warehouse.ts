export interface WarehouseItem {
  id: number
  warehouseCode: string
  warehouseNameEn: string
  warehouseNameCn: string
  portCode: string
  portRole: string
  warehouseType: string
  address: string
  address2: string
  createTime: string
  createUser: string
  updateTime: string
  updateUser: string
  isValid: number
}

export interface WarehouseSearchParams {
  pageNum: number
  pageSize: number
  warehouseCode?: string
  warehouseNameEn?: string
  warehouseNameCn?: string
  portCode?: string
  portRole?: string
  warehouseType?: string
  address?: string
  address2?: string
  isValid?: number
}

export interface WarehouseResponse {
  code: number
  msg: string
  data: {
    list: WarehouseItem[]
    pageCount: number
    pageNum: number
    pageSize: number
    total: number
  }
}
