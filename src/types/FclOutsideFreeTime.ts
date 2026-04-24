export interface FclOutsideFreeTimeItem {
  id: number
  customerName: string
  carrierCode: string
  tradeLane: string
  contractType: string
  businessType: string
  containerType: string
  route: string
  podType: string
  pod: string
  ddType: string
  freeDays: number | undefined
  freeUnit: string
  remarks: string
  createTime: string
  createUser: string
  updateTime: string
  updateUser: string
  isValid: number
}

export interface FclOutsideFreeTimeSearchParams {
  pageNum: number
  pageSize: number
  customerName?: string
  carrierCode?: string
  tradeLane?: string
  contractType?: string
  businessType?: string
  containerType?: string
  route?: string
  podType?: string
  pod?: string
  ddType?: string
  isValid?: number
}

export interface FclOutsideFreeTimeResponse {
  code: number
  msg: string
  data: {
    list: FclOutsideFreeTimeItem[]
    pageCount: number
    pageNum: number
    pageSize: number
    total: number
  }
}
