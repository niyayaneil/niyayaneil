export interface BillItemSearch {
  countryNumCode: string
  stateNumCode: string
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
  id?: number;

  countryNumCode: string;
  countryNameCn?: null;
  countryNameEn?: null;

  stateNumCode: string;
  stateNameCn?: null;
  stateNameEn?: null;

  numCode: string;
  nameCn?: string;
  nameEn?: string;

  isValid: string;

  systemUpdateTimeUtc?: string;
  systemUpdateUser?: string;
}