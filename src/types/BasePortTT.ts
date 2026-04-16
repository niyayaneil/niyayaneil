export interface BillItemSearch {
  polCode: string
  podCode: string
  pageNum: number
  pageSize: number
  orderBys: string
}

export interface BillItemSearchResult {
  list: BillItemSearchResultItem[]
  total: number
  pageNum: number
  pageSize: number
  pageCount: number
}
export interface BillItemSearchResultItem {
  id?: number
  carrier: string
  etd: string
  isValid: string
  podCode: string
  polCode: string
  remark: string
  routeCode: string
  serviceCode: string
  svcCode: string
  tt: number
  systemUpdateTimeUtc?: string
  systemUpdateUser?: string
}
