export interface FclOverweightRuleLadderItem {
  id: number
  mainId: number
  ladderMinKgs: number | null
  ladderMaxKgs: number | null
  chargeType: string
  unitPrice: number | null
  minPrice: number | null
  maxPrice: number | null
  currency: string
  unit: string
  remarks: string
  isValid: number
  createTime?: string
  updateTime?: string
  createUser?: string
  updateUser?: string
}