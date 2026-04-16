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
  cargowise9Code: string
  code: string
  id?: number
  isValid: string
  logoUrl?: string;
  name: string
  sort: number
  systemUpdateUser?: string;
  systemUpdateTimeUtc?: string;
  webUrl: string;
}