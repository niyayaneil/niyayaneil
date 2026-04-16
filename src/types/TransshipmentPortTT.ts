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
  polCode: string
  podCode: string
  tt: number
  isValid: string
  remark: string
  systemUpdateTimeUtc?: string
  systemUpdateUser?: string
}
