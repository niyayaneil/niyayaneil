import { request } from '@/utils/request'
import type { AircompanyItem, AircompanySearchParams, AircompanyResponse } from '@/types/Aircompany'

export const getAircompanyList = (params: AircompanySearchParams) => {
  return request<AircompanyResponse>('/mgr/airCompanies/page', 'post', params)
}
