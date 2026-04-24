export interface FclOverweightRuleItem {
  id: number
  carrierCode: string
  tradeLane: string
  businessType: string
  serviceMode: string
  containerType: string
  route: string
  serviceRegion: string
  podCode: string
  maxNetWeightKgs: number
  validFrom: string
  validTo: string
  remarks: string
  contractType: string
  svcCode: string
  createTime: string
  createUser: string
  updateTime: string
  updateUser: string
  isValid: number
  ladders?: any[]
}

export interface FclOverweightRuleSearchParams {
  pageNum: number
  pageSize: number
  carrierCode: string
  tradeLane: string
  businessType: string
  serviceMode: string
  containerType: string
  route: string
  serviceRegion: string
  podCode: string
  contractType: string
  svcCode: string
  isValid: string
}

export interface FclOverweightRuleResponse {
  code: number
  msg: string
  data: {
    list: FclOverweightRuleItem[]
    total: number
  }
}
