export interface BillItemSearch {
  countryNumCode: string
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
  id?: number

  countryNumCode: string;
  countryNameEn?: null;
  countryNameCn?: null;

  numCode: string;
  nameCn?: string;
  nameEn?: string;

  isValid: string;
  systemUpdateTimeUtc?: string;
  systemUpdateUser?: string;
}