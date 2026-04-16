export interface BillItemSearch {
  countryCode: string
  stateCode: string
  cityCode: string
  globalAreaId: string
  code: string
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
  cityCode: string;
  cityNameCn?: string;
  cityNameEn?: string;
  code: string;
  countryCode: string;
  countryNameCn?: string;
  countryNameEn?: string;
  globalAreaCode?: string;
  globalAreaId?: number;
  globalAreaName?: string;
  groupName: string;
  id?: number;
  isValid: string;
  nameCn?: string;
  nameEn?: string;
  portFullName?: string;
  stateCode: string;
  stateNameCn?: string;
  stateNameEn?: string;
}
