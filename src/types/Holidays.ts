export interface BillItemSearch {
  pageNum: number
  pageSize: number
  orderBys: string;
}

export interface BillItemSearchResult {
  list: BillItemSearchResultItem[]
  total: number,
  pageNum: number,
  pageSize: number,
  pageCount: number
}
export interface BillItemSearchResultItem {
  countryNameEn?: string
  countryNumCode: string
  id: number
  restDay: string
  restDayType: string
  restDayTypeName?: string
  systemUpdateUser?: string
  systemUpdateTimeUtc?: string
}
