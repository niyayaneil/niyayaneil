export interface FclDndRateItem {
  id: number
  carrierCode: string
  tradeLane: string
  chargeType: string
  businessType: string
  portCode: string
  containerType: string
  freeDays: string
  freeUnit: string
  freeDaysRule: string
  specialRule: string
  tier1Days: string
  tier1Rate: number | undefined
  tier2Days: string
  tier2Rate: number | undefined
  tier3Days: string
  tier3Rate: number | undefined
  tier4Days: string
  tier4Rate: number | undefined
  currency: string
  remarks: string
  validFrom: string
  validTo: string
  createTime: string
  createUser: string
  updateTime: string
  updateUser: string
  isValid: number
}

export interface FclDndRateSearchParams {
  pageNum: number
  pageSize: number
  carrierCode?: string
  tradeLane?: string
  chargeType?: string
  businessType?: string
  portCode?: string
  containerType?: string
  isValid?: number
}

export interface FclDndRateResponse {
  code: number
  msg: string
  data: {
    list: FclDndRateItem[]
    pageCount: number
    pageNum: number
    pageSize: number
    total: number
  }
}
