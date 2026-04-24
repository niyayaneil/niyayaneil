import { request } from '@/utils/request'
import type { FclOverweightRuleLadderItem } from '@/types/FclOverweightRuleLadder'

// 根据主表ID获取阶梯列表
export const getFclOverweightRuleLadderList = (mainId: number) => {
  // ✅ 改回：后端接口是 /mgr/fclOverweightRuleLadder/main/{mainId}
  return request(`/mgr/fclOverweightRuleLadder/main/${mainId}`, 'get')
}

// 新增阶梯
export const addFclOverweightRuleLadderApi = (mainId: number, data: Partial<FclOverweightRuleLadderItem>) => {
  // ✅ 改回：后端接口是 /mgr/fclOverweightRuleLadder/main/{mainId}
  return request(`/mgr/fclOverweightRuleLadder/main/${mainId}`, 'post', data)
}

// 编辑阶梯
export const editFclOverweightRuleLadderApi = (id: number, data: Partial<FclOverweightRuleLadderItem>) => {
  // ✅ 这个保持不变，后端有这个接口
  return request(`/mgr/fclOverweightRuleLadder/${id}`, 'put', data)
}

// 删除阶梯
export const deleteFclOverweightRuleLadderApi = (id: number) => {
  // ✅ 这个保持不变，后端有这个接口
  return request(`/mgr/fclOverweightRuleLadder/${id}`, 'delete')
}