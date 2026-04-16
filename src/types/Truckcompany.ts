export interface TruckcompanyItem {
  id: number
  truckCode: string
  truckNameEn: string
  truckNameCn: string
  unlocode: string
  createTime: string
  createUser: string
  updateTime: string
  updateUser: string
  isValid: number
}

export interface TruckcompanySearchParams {
  pageNum: number
  pageSize: number
  truckCode?: string
  truckNameEn?: string
  truckNameCn?: string
  unlocode?: string
  isValid?: number
}

export interface TruckcompanyResponse {
  code: number
  msg: string
  data: {
    list: TruckcompanyItem[]
    pageCount: number
    pageNum: number
    pageSize: number
    total: number
  }
}
