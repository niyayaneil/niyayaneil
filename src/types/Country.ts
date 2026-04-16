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
  code: string;
  id?: number;
  nameCn: string;
  nameEn: string;
  numCode: string;
  flagUrl: string;
  isValid: string;
  systemUpdateUser?: string;
  systemUpdateTimeUtc?: string;
}