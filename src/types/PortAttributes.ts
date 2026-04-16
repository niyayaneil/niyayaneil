export interface BillItemSearch {
  globalPortCode: string
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
  globalPortAttriCode?: string;
  globalPortAttriId: number | string;
  globalPortAttriName?: string;
  globalPortAttriType: string;
  globalPortCode: string;
  globalPortId?: number;
  globalPortNameCn?: string;
  globalPortNameEn?: string;
  id?: number;
  isValid: string;
  systemUpdateTimeUtc?: string;
  systemUpdateUser?: string;
}
