export interface FclOriginChargeItem {
  id: number
  carrierCode: string
  tradeLane: string
  businessType: string
  agentName: string
  polCode: string
  feeItem: string
  portCode: string
  containerType: string
  chargeType: string
  baseRate: number | undefined
  currency: string
  '20gp': number | undefined
  '40gp': number | undefined
  '40hq': number | undefined
  '45hq': number | undefined
  '20fl': number | undefined
  '40fl': number | undefined
  '40ot': number | undefined
  '20ot': number | undefined
  '40otq': number | undefined
  '40rq': number | undefined
  '40nor': number | undefined
  '20rf': number | undefined
  '40rf': number | undefined
  flatRate: number | undefined
  unit: string
  paymentTerm: string
  specialBillingRule: string
  validFrom: string
  validTo: string
  remarks: string
  createTime: string
  createUser: string
  updateTime: string
  updateUser: string
  isValid: number
}

export interface FclOriginChargeSearchParams {
  pageNum: number
  pageSize: number
  carrierCode?: string
  tradeLane?: string
  businessType?: string
  agentName?: string
  polCode?: string
  feeItem?: string
  portCode?: string
  containerType?: string
  chargeType?: string
  isValid?: number
}

export interface FclOriginChargeResponse {
  code: number
  msg: string
  data: {
    list: FclOriginChargeItem[]
    pageCount: number
    pageNum: number
    pageSize: number
    total: number
  }
}
