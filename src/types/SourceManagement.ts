export interface BillItemSearch {
  pageNum: number
  pageSize: number
  orderBys: string,
}

export interface BillItemSearchResult {
  list: BillItemSearchResultItem[]
  total: number,
  pageNum: number,
  pageSize: number,
  pageCount: number
}
export interface BillItemSearchResultItem {
  id: number,
  version: string,
  isValid: string,
  systemCreateTimeUtc: string,
  systemCreateUser: string,
  systemUpdateTimeUtc: string,
  systemUpdateUser: string,
  name: string,
  code: string
}