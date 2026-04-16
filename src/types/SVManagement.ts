export interface BillItemSearch {
  carrierCompanyCodeList: string
  codeList: string
  startPortCodeList: string
  endPortCodeList: string
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
  id?: number;
  carrierCompanyCode: string;
  code: string;
  endPortCode: string;
  startPortCode: string;
  isValid: string;
  systemUpdateTimeUtc?: string;
  systemUpdateUser?: string;
}
