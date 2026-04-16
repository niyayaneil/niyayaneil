export interface BillItemSearch {
  terminalCode: string
  portCode: string
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
  id?: number
  carrierCompanyCode: string
  isValid: string
  nameCn: string
  nameEn: string
  portCode: string
  portFullName?: string
  source: string
  sourceName?: string
  terminalCode: string
  terminalNameCn?: string
  terminalNameEn?: string
  systemUpdateTimeUtc?: string
  systemUpdateUser?: string
}
