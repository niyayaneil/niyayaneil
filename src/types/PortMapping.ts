export interface BillItemSearch {
  carrierCompanyCode: string
  mappingData: string
  portCode: string
  source: string
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
  carrierCompanyCode: string;
  id?: number;
  isValid: string;
  mappingData: string;
  PortNameEn?: string;
  portCode: string;
  source: string;
  sourceName?: string;
  systemUpdateTimeUtc?: string;
  systemUpdateUser?: string;
}
