export interface AircompanyItem {
  id: number
  iataCode: string
  airlineNameEn: string
  airlineNameCn: string
  cargowiseCode: string
  unlocode: string
  airCargoUrl: string
  createTime: string
  createUser: string
  updateTime: string
  updateUser: string
}

export interface AircompanySearchParams {
  pageNum: number
  pageSize: number
  iataCode?: string
  airlineNameEn?: string
  airlineNameCn?: string
  cargowiseCode?: string
  unlocode?: string
}

export interface AircompanyResponse {
  code: number
  msg: string
  data: {
    list: AircompanyItem[]
    pageCount: number
    pageNum: number
    pageSize: number
    total: number
  }
}
