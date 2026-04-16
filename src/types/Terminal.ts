export interface BillItemSearch {
  code: string
  isValid: string
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
  code: string
  id?: number
  isValid: string
  nameCn: string
  nameEn: string
  portCode: string
  portFullName?: string
  systemUpdateTimeUtc?: string
  systemUpdateUser?: string
}
