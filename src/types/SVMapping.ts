export interface BillItemSearch {
  isValid: string
  pageNum: number
  pageSize: number
  orderBys: string
}

export interface BillItemSearchResult {
  list: BillItemSearchResultItem[]
  total: number,
  pageNum: number,
  pageSize: number,
  pageCount: number
}
export interface BillItemSearchResultItem {
  carrierCompanyCode: string
  carrierServiceCode: string
  id?: number
  isValid: string
  mappingData: string
  source: string
  systemUpdateTimeUtc?: string
  systemUpdateUser?: string
}
