<script setup lang="ts">
import { onMounted, ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import { getFclOverweightRuleList, addFclOverweightRuleApi, editFclOverweightRuleApi, patchFclOverweightRuleValidApi } from '@/api/FclOverweightRule'
import { getFclOverweightRuleLadderList, addFclOverweightRuleLadderApi, editFclOverweightRuleLadderApi, deleteFclOverweightRuleLadderApi } from '@/api/FclOverweightRuleLadder'
import { getOptionsListApi } from '@/api/Public'
import type { FclOverweightRuleItem, FclOverweightRuleSearchParams } from '@/types/FclOverweightRule'
import type { FclOverweightRuleLadderItem } from '@/types/FclOverweightRuleLadder'

// 缓存相关配置
const CACHE_KEY = 'route_list_cache'
const CACHE_VALID_KEY = 'route_list_valid_cache'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24小时

// 检查缓存是否有效
const isCacheValid = (cacheKey: string): boolean => {
  const cached = localStorage.getItem(cacheKey)
  if (!cached) return false
  try {
    const parsed = JSON.parse(cached)
    return Date.now() - parsed.timestamp < CACHE_EXPIRY
  } catch (e) {
    return false
  }
}

// 从缓存获取数据
const getFromCache = (cacheKey: string): { label: string; value: string | number }[] => {
  const cached = localStorage.getItem(cacheKey)
  if (!cached) return []
  try {
    const parsed = JSON.parse(cached)
    return parsed.data || []
  } catch (e) {
    return []
  }
}

// 保存数据到缓存
const saveToCache = (cacheKey: string, data: { label: string; value: string | number }[]) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.error('Failed to save to cache:', e)
  }
}

const carrierList = ref<{ label: string; value: string | number }[]>([])
const carrierListValid = ref<{ label: string; value: string | number }[]>([])
const contractTypeList = ref<{ label: string; value: string | number }[]>([])
const routeList = ref<{ label: string; value: string | number }[]>([])
const routeListValid = ref<{ label: string; value: string | number }[]>([])

onMounted(() => {
  getTableList()
  // 获取船司列表
  getOptionsListApi({ carriers: {} }).then((res: any) => {
    if (res.data.carriers.length > 0) {
      carrierList.value = res.data.carriers
    }
  })
  getOptionsListApi({ carriers: { isValid: '1' } }).then((res: any) => {
    if (res.data.carriers.length > 0) {
      carrierListValid.value = res.data.carriers
    }
  })
  // 获取合同类型列表
  getFclOverweightRuleList({ pageNum: 1, pageSize: 1000, carrierCode: '', tradeLane: '', businessType: '', containerType: '', route: '', serviceRegion: '', podCode: '', contractType: '', serviceMode: '', svcCode: '', isValid: '' }).then((res: any) => {
    if (res.data.list.length > 0) {
      const contractTypes = [...new Set(res.data.list.map((item: any) => item.contractType))]
      contractTypeList.value = contractTypes.map(type => ({ label: type, value: type }))
    }
  })
  // 获取Route列表（带缓存和请求优化）
  if (isCacheValid(CACHE_KEY)) {
    routeList.value = getFromCache(CACHE_KEY)
  } else {
    // 添加超时和错误处理
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超时
    
    getOptionsListApi({ globalPorts: {} }, { signal: controller.signal })
      .then((res: any) => {
        clearTimeout(timeoutId)
        if (res.data && res.data.globalPorts && res.data.globalPorts.length > 0) {
          routeList.value = res.data.globalPorts
          saveToCache(CACHE_KEY, res.data.globalPorts)
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          console.log('Route list request timeout')
          // 使用缓存数据作为 fallback
          if (getFromCache(CACHE_KEY).length > 0) {
            routeList.value = getFromCache(CACHE_KEY)
          }
        } else {
          console.error('Error fetching route list:', error)
        }
      })
  }
  
  // 获取有效Route列表（带缓存和请求优化）
  if (isCacheValid(CACHE_VALID_KEY)) {
    routeListValid.value = getFromCache(CACHE_VALID_KEY)
  } else {
    // 添加超时和错误处理
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超时
    
    getOptionsListApi({ globalPorts: { isValid: '1' } }, { signal: controller.signal })
      .then((res: any) => {
        clearTimeout(timeoutId)
        if (res.data && res.data.globalPorts && res.data.globalPorts.length > 0) {
          routeListValid.value = res.data.globalPorts
          saveToCache(CACHE_VALID_KEY, res.data.globalPorts)
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          console.log('Valid route list request timeout')
          // 使用缓存数据作为 fallback
          if (getFromCache(CACHE_VALID_KEY).length > 0) {
            routeListValid.value = getFromCache(CACHE_VALID_KEY)
          }
        } else {
          console.error('Error fetching valid route list:', error)
        }
      })
  }
})

const onSearch = () => {
  form.value.pageNum = 1
  getTableList()
}
const onReset = () => {
  form.value.carrierCode = ''
  form.value.tradeLane = ''
  form.value.contractType = ''
  form.value.containerType = ''
  form.value.businessType = ''
  form.value.serviceMode = ''
  form.value.svcCode = ''
  form.value.route = ''
  form.value.serviceRegion = ''
  form.value.podCode = ''
  form.value.isValid = ''
  form.value.pageNum = 1
  form.value.pageSize = 30
  getTableList()
}

// 搜索
const form = ref<FclOverweightRuleSearchParams>({
  pageNum: 1,
  pageSize: 30,
  carrierCode: '',
  tradeLane: '',
  contractType: '',
  containerType: '',
  businessType: '',
  serviceMode: '',
  svcCode: '',
  route: '',
  serviceRegion: '',
  podCode: '',
  isValid: ''
})
const loading = ref(false)
const ladderLoading = ref(false)

const getTableList = async () => {
  try {
    loading.value = true
    const response = await getFclOverweightRuleList(form.value)
    const list = response.data.list || []
    tableData.value = list
    total.value = response.data.total
  } catch (error) {
    ElMessage({
      type: 'error',
      message: 'Failed to get FCL overweight rule list'
    })
  } finally {
    loading.value = false
  }
}

// ======================== 阶梯表相关方法 ========================

// 获取阶梯表数据
const getLadderList = async (row: FclOverweightRuleItem) => {
  try {
    ladderLoading.value = true
    const response = await getFclOverweightRuleLadderList(row.id)
    row.ladders = response.data || []
  } catch (error) {
    console.error('Failed to get ladder list:', error)
    row.ladders = []
  } finally {
    ladderLoading.value = false
  }
}

// 展开行时加载阶梯数据
const handleExpandChange = (row: FclOverweightRuleItem, expandedRows: any) => {
  // 判断是否是展开操作
  const isExpanded = expandedRows.some((r: any) => r.id === row.id)
  // 修改条件：展开 && (ladders不存在 或 ladders是空数组)
  if (isExpanded && (!row.ladders || (Array.isArray(row.ladders) && row.ladders.length === 0))) {
    getLadderList(row)
  }
}

// 添加阶梯
const addLadder = (row: FclOverweightRuleItem) => {
  currentRuleRow.value = row
  ladderDialogTitle.value = 'Add Ladder'
  ladderForm.value = {
    id: 0,
    mainId: row.id,
    ladderMinKgs: null,
    ladderMaxKgs: null,
    chargeType: '',
    unitPrice: null,
    minPrice: null,
    maxPrice: null,
    currency: 'USD',
    unit: '',
    remarks: '',
    isValid: 1
  }
  ladderDialogVisible.value = true
}

// 编辑阶梯
const editLadder = (ladder: FclOverweightRuleLadderItem, row: FclOverweightRuleItem) => {
  currentRuleRow.value = row
  ladderDialogTitle.value = 'Edit Ladder'
  ladderForm.value = { ...ladder }
  ladderDialogVisible.value = true
}

// 删除阶梯
const deleteLadder = async (ladder: FclOverweightRuleLadderItem, row: FclOverweightRuleItem) => {
  ElMessageBox.confirm('Are you sure to delete this ladder?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteFclOverweightRuleLadderApi(ladder.id)
      ElMessage({ type: 'success', message: 'Deleted successfully' })
      getLadderList(row)
    } catch (error) {
      ElMessage({ type: 'error', message: 'Delete failed' })
    }
  }).catch(() => {})
}

// 提交阶梯表单
const submitLadderForm = async () => {
  if (!ladderForm.value.chargeType) {
    ElMessage.warning('Please enter charge type')
    return
  }
  try {
    ladderSubmitLoading.value = true
    if (ladderDialogTitle.value === 'Add Ladder') {
      await addFclOverweightRuleLadderApi(currentRuleRow.value.id, ladderForm.value)
      ElMessage({ type: 'success', message: 'Added successfully' })
    } else {
      await editFclOverweightRuleLadderApi(ladderForm.value.id, ladderForm.value)
      ElMessage({ type: 'success', message: 'Updated successfully' })
    }
    ladderDialogVisible.value = false
    getLadderList(currentRuleRow.value)
  } catch (error) {
    ElMessage({ type: 'error', message: 'Operation failed' })
  } finally {
    ladderSubmitLoading.value = false
  }
}

// ======================== 原有方法 ========================

const indexMethod = (index: number) => {
  let current = form.value.pageNum
  let limit = form.value.pageSize
  return index + 1 + (current - 1) * limit
}

const total = ref(0)
const handlePageSizeChange = (val: number) => {
  form.value.pageSize = val
  getTableList()
}

const handlePageNumChange = (val: number) => {
  form.value.pageNum = val
  getTableList()
}

const tableData = ref<FclOverweightRuleItem[]>([])

// 添加主表
const add = () => {
  titleDialog.value = 'New FCL Overweight Rule'
  ruleForm.value = {
    id: 0,
    carrierCode: '',
    tradeLane: '',
    contractType: '',
    containerType: '',
    businessType: '',
    serviceMode: '',
    svcCode: '',
    route: '',
    serviceRegion: '',
    podCode: '',
    maxNetWeightKgs: 0,
    validFrom: '',
    validTo: '',
    remarks: '',
    createTime: '',
    createUser: '',
    updateTime: '',
    updateUser: '',
    isValid: 1
  }
  nextTick(() => {
    ruleFormRef.value?.clearValidate()
  })
  visibleDialog.value = true
}

const edit = (row: FclOverweightRuleItem) => {
  titleDialog.value = 'Edit FCL Overweight Rule'
  visibleDialog.value = true
  nextTick(() => {
    for (let key in ruleForm.value) {
      if (row.hasOwnProperty(key)) {
        ruleForm.value[key] = row[key]
      }
    }
  })
}

// 状态切换
const handleStatusChange = async (row: FclOverweightRuleItem, newValue: number) => {
  const originalValue = newValue === 1 ? 0 : 1

  ElMessageBox.confirm('Please confirm this operation', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(async () => {
      try {
        await patchFclOverweightRuleValidApi(row.id, newValue)
        ElMessage({ type: 'success', message: 'Status updated successfully' })
        getTableList()
      } catch (error) {
        row.isValid = originalValue
        ElMessage({ type: 'error', message: 'Update failed' })
      }
    })
    .catch(() => {
      row.isValid = originalValue
      ElMessage({ type: 'info', message: 'Operation cancelled' })
    })
}

// 主表弹窗
const visibleDialog = ref(false)
const titleDialog = ref('')
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<FclOverweightRuleItem>>({
  carrierCode: [{ required: true, message: 'Required', trigger: 'change' }],
  tradeLane: [{ required: true, message: 'Required', trigger: 'change' }],
  contractType: [{ required: true, message: 'Required', trigger: 'change' }],
  containerType: [{ required: true, message: 'Required', trigger: 'change' }],
  businessType: [{ required: true, message: 'Required', trigger: 'change' }],
  serviceMode: [],
  svcCode: [],
  route: [],
  serviceRegion: [],
  podCode: [],
  maxNetWeightKgs: [
    { required: true, message: 'Required', trigger: 'change' },
    { type: 'number', min: 0, message: 'Max net weight must be non-negative', trigger: 'change' }
  ],
  validFrom: [],
  validTo: [],
})

const ruleForm = ref<FclOverweightRuleItem>({
  id: 0,
  carrierCode: '',
  tradeLane: '',
  contractType: '',
  containerType: '',
  businessType: '',
  serviceMode: '',
  svcCode: '',
  route: '',
  serviceRegion: '',
  podCode: '',
  maxNetWeightKgs: 0,
  validFrom: '',
  validTo: '',
  remarks: '',
  createTime: '',
  createUser: '',
  updateTime: '',
  updateUser: '',
  isValid: 1
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      const formCopy = {
        id: ruleForm.value.id,
        carrierCode: ruleForm.value.carrierCode,
        tradeLane: ruleForm.value.tradeLane,
        contractType: ruleForm.value.contractType,
        containerType: ruleForm.value.containerType,
        businessType: ruleForm.value.businessType,
        serviceMode: ruleForm.value.serviceMode,
        svcCode: ruleForm.value.svcCode,
        route: ruleForm.value.route,
        serviceRegion: ruleForm.value.serviceRegion,
        podCode: ruleForm.value.podCode,
        maxNetWeightKgs: ruleForm.value.maxNetWeightKgs,
        validFrom: ruleForm.value.validFrom,
        validTo: ruleForm.value.validTo,
        remarks: ruleForm.value.remarks,
        isValid: ruleForm.value.isValid
      }
      if (titleDialog.value === 'New FCL Overweight Rule') {
        delete (formCopy as any).id
        addFclOverweightRuleApi(formCopy).then((res) => {
          if (res.code === 200) {
            getTableList()
            closeDialog()
            ElMessage({ type: 'success', message: 'FCL overweight rule added successfully' })
          }
        }).catch((err) => {
          console.error('Add failed:', err)
          ElMessage({ type: 'error', message: 'Failed to add FCL overweight rule' })
        }).finally(() => {
          loading.value = false
        })
      } else {
        editFclOverweightRuleApi(formCopy).then((res) => {
          if (res.code === 200) {
            getTableList()
            closeDialog()
            ElMessage({ type: 'success', message: 'FCL overweight rule updated successfully' })
          }
        }).catch((err) => {
          console.error('Edit failed:', err)
          ElMessage({ type: 'error', message: 'Failed to edit FCL overweight rule' })
        }).finally(() => {
          loading.value = false
        })
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}

const closeDialog = () => {
  visibleDialog.value = false
  nextTick(() => {
    ruleFormRef.value?.resetFields()
  })
}

// ======================== 阶梯表弹窗状态 ========================

const ladderDialogVisible = ref(false)
const ladderDialogTitle = ref('')
const ladderSubmitLoading = ref(false)
const currentRuleRow = ref<FclOverweightRuleItem | null>(null)

const ladderForm = ref<FclOverweightRuleLadderItem>({
  id: 0,
  mainId: 0,
  ladderMinKgs: null,
  ladderMaxKgs: null,
  chargeType: '',
  unitPrice: null,
  minPrice: null,
  maxPrice: null,
  currency: 'USD',
  unit: '',
  remarks: '',
  isValid: 1
})

const htmlContent = ref(``)
</script>

<template>
  <div class="mt-[3px]">
    <div class="p-[24px] bg-white">
      <!-- 搜索表单 -->
      <el-form
        :inline="true"
        :model="form"
        ref="ruleFormRef"
        class="demo-form-inline"
        label-position="right"
        label-width="auto"
      >
        <el-form-item label="Carrie" prop="carrierCode">
          <el-select v-model="form.carrierCode" filterable placeholder="Select Carrie" clearable style="width: 150px">
            <el-option v-for="item in carrierList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Trade Lane" prop="tradeLane">
          <el-select v-model="form.tradeLane" clearable placeholder="Select Trade Lane" style="width: 150px">
            <el-option label="US" value="US" />
            <el-option label="CA" value="CA" />
          </el-select>
        </el-form-item>
        <el-form-item label="Contract Type" prop="contractType">
          <el-select v-model="form.contractType" clearable placeholder="Select Contract Type" style="width: 150px">
            <el-option v-for="item in contractTypeList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Container Type" prop="containerType">
          <el-select v-model="form.containerType" clearable placeholder="Select Container Type" style="width: 150px">
            <el-option label="20GP" value="20GP" />
            <el-option label="40GP" value="40GP" />
            <el-option label="40HQ" value="40HQ" />
            <el-option label="45HQ" value="45HQ" />
          </el-select>
        </el-form-item>
        <el-form-item label="Business Type" prop="businessType">
          <el-select v-model="form.businessType" clearable placeholder="Select Business Type" style="width: 150px">
            <el-option label="BASE" value="BASE" />
            <el-option label="IPI" value="IPI" />
          </el-select>
        </el-form-item>
        <el-form-item label="Route" prop="route">
          <el-select v-model="form.route" filterable clearable placeholder="Select Route" style="width: 150px" virtual :max-height="300">
            <el-option
              v-for="item in routeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Service Region" prop="serviceRegion">
          <el-select v-model="form.serviceRegion" clearable placeholder="Select Service Region" style="width: 150px">
            <el-option label="REGION" value="REGION" />
            <el-option label="PORT" value="PORT" />
          </el-select>
        </el-form-item>
        <el-form-item label="POD Code" prop="podCode">
          <el-input v-model="form.podCode" placeholder="Input" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" class="bg-[#2D8AE0]">Search</el-button>
          <el-button @click="onReset">Reset</el-button>
        </el-form-item>
      </el-form>

      <div class="flex">
        <el-button @click="add" class="flex h-[33px] text-[#fff] mb-[12px] text-[14px] px-4 justify-center items-center gap-6 rounded-[4px] bg-[#2D8AE0]">
          <div class="w-[14px] h-[14px] mr-[8px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M7 1.3125C6.75838 1.3125 6.5625 1.50838 6.5625 1.75V6.5625H1.75C1.50838 6.5625 1.3125 6.75838 1.3125 7C1.3125 7.24162 1.50838 7.4375 1.75 7.4375H6.5625V12.25C6.5625 12.4916 6.75838 12.6875 7 12.6875C7.24162 12.6875 7.4375 12.4916 7.4375 12.25V7.4375H12.25C12.4916 7.4375 12.6875 7.24162 12.6875 7C12.6875 6.75838 12.4916 6.5625 12.25 6.5625H7.4375V1.75C7.4375 1.50838 7.24162 1.3125 7 1.3125Z" fill="white"/>
            </svg>
          </div>
          New FCL Overweight Rule
        </el-button>
      </div>

      <div style="width: 100%; margin-bottom: 10px;">
        <div style="overflow-x: auto; width: 100%; scrollbar-width: thin; max-height: calc(100vh - 320px);">
          <div style="min-width: 3500px;">
            <el-table
              v-loading="loading"
              :data="tableData"
              style="width: 100%"
              @expand-change="handleExpandChange"
              stripe
              empty-text="No data available"
              row-key="id"
            >
              <!-- 展开列 -->
              <el-table-column type="expand">
                <template #default="{ row }">
                  <div class="ladder-container">
                    <div class="ladder-header">
                      <span class="ladder-title">Ladder Rules</span>
                      <el-button size="small" type="primary" @click="addLadder(row)">+ Add Ladder</el-button>
                    </div>
                    <el-table
                      v-loading="ladderLoading"
                      :data="row.ladders || []"
                      border
                      size="small"
                      class="ladder-table"
                    >
					 <el-table-column type="index" label="#" width="60" />
					
                      <el-table-column prop="ladderMinKgs" label="Min Weight (KG)" width="140">
                        <template #default="{ row: ladder }">
                          {{ ladder.ladderMinKgs ?? '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="ladderMaxKgs" label="Max Weight (KG)" width="140">
                        <template #default="{ row: ladder }">
                          {{ ladder.ladderMaxKgs ?? 'No Limit' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="chargeType" label="Charge Type" width="120" />
                      <el-table-column prop="unitPrice" label="Unit Price" width="120">
                        <template #default="{ row: ladder }">
                          {{ ladder.unitPrice ?? '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="minPrice" label="Min Price" width="120">
                        <template #default="{ row: ladder }">
                          {{ ladder.minPrice ?? '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="maxPrice" label="Max Price" width="120">
                        <template #default="{ row: ladder }">
                          {{ ladder.maxPrice ?? '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="currency" label="Currency" width="100" />
                      <el-table-column prop="unit" label="Unit" width="100" />
                      <el-table-column prop="remarks" label="Remarks" min-width="150" show-overflow-tooltip />
                      <el-table-column label="Actions" width="100" fixed="right">
                        <template #default="{ row: ladder }">
                          <el-button link type="primary" size="small" @click="editLadder(ladder, row)">Edit</el-button>
                          <el-button link type="danger" size="small" @click="deleteLadder(ladder, row)">Delete</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div v-if="!row.ladders || row.ladders.length === 0" class="ladder-empty">
                      No ladder rules configured
                    </div>
                  </div>
                </template>
              </el-table-column>

              <!-- 原有列 -->
              <el-table-column prop="id" label="#" width="60">
                <template #default="{ $index }">
                  <div>{{ indexMethod($index) }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="carrierCode" label="Carrie" min-width="118" show-overflow-tooltip />
              <el-table-column prop="tradeLane" label="Trade Lane" min-width="118" show-overflow-tooltip />
              <el-table-column prop="contractType" label="Contract Type" min-width="118" show-overflow-tooltip />
              <el-table-column prop="containerType" label="Container Type" min-width="118" show-overflow-tooltip />
              <el-table-column prop="businessType" label="Business Type" min-width="118" show-overflow-tooltip />
              <el-table-column prop="serviceMode" label="Service Mode" min-width="118" show-overflow-tooltip />
              <el-table-column prop="svcCode" label="SVC Code" min-width="118" show-overflow-tooltip />
              <el-table-column prop="route" label="Route" min-width="118" show-overflow-tooltip />
              <el-table-column prop="serviceRegion" label="Service Region" min-width="118" show-overflow-tooltip />
              <el-table-column prop="podCode" label="POD Code" min-width="118" show-overflow-tooltip />
              <el-table-column prop="maxNetWeightKgs" label="Max Net Weight (Kgs)" min-width="118" show-overflow-tooltip />
              <el-table-column prop="validFrom" label="Valid From" min-width="150" show-overflow-tooltip />
              <el-table-column prop="validTo" label="Valid To" min-width="150" show-overflow-tooltip />
              <el-table-column prop="remarks" label="Remarks" min-width="150" show-overflow-tooltip />
              <el-table-column prop="updateUser" label="Updater" width="108" show-overflow-tooltip />
              <el-table-column prop="updateTime" sortable label="Update Time" width="156" show-overflow-tooltip>
                <template #default="{ row }">
                  <div>{{ row.updateTime }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="isValid" label="Status" width="80">
                <template #default="{ row }">
                  <el-switch v-model="row.isValid" :active-value="1" :inactive-value="0" @change="(val) => handleStatusChange(row, val)" />
                </template>
              </el-table-column>
              <el-table-column label="" min-width="60">
                <template #default="{ row }">
                  <div class="w-[16px] h-[16px] cursor-pointer" @click="edit(row)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M7.37704 2.62305L4.31409 2.62305C3.87712 2.62305 3.45805 2.79663 3.14907 3.10561C2.84009 3.4146 2.6665 3.83367 2.6665 4.27063V11.6848C2.6665 12.1217 2.84009 12.5408 3.14907 12.8498C3.45805 13.1588 3.87712 13.3324 4.31409 13.3324H11.7282C12.1652 13.3324 12.5843 13.1588 12.8933 12.8498C13.2022 12.5408 13.3758 12.1217 13.3758 11.6848V8.87645" stroke="#2D8AE0" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M13.7224 4.08671C13.9624 3.84674 14.0972 3.52128 14.0972 3.18191C14.0972 2.84255 13.9624 2.51709 13.7224 2.27712C13.4824 2.03716 13.157 1.90234 12.8176 1.90234C12.4782 1.90234 12.1528 2.03716 11.9128 2.27712L6.78564 7.386V9.21387H8.61351L13.7224 4.08671Z" stroke="#2D8AE0" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M11.0508 3.12109L12.8786 4.94896" stroke="#2D8AE0" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 分页器 -->
      <div class="mt-[16px] flex items-center gap-4 justify-end">
        <div class="text-[#97989A]">Total {{ total }} Items</div>
        <el-pagination
          v-model:current-page="form.pageNum"
          v-model:page-size="form.pageSize"
          :page-sizes="[30, 50, 100, 200]"
          layout="sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
    </div>

    <!-- 主表弹窗 -->
    <el-dialog v-model="visibleDialog" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" width="680">
      <template #header="{ titleId, titleClass }">
        <div class="flex justify-between">
          <div :id="titleId" :class="titleClass">{{ titleDialog }}</div>
          <div class="flex items-center">
            <el-tooltip placement="bottom-end" effect="light" popper-class="mark">
              <template #content><div v-html="htmlContent"></div></template>
              <div class="w-[16px] h-[16px] cursor-pointer mr-[24px]" v-if="htmlContent">
                <img src="@/assets/images/mark.jpg" class="w-full h-full" />
              </div>
            </el-tooltip>
            <div class="w-[16px] h-[16px] cursor-pointer" @click="closeDialog">
              <img src="@/assets/images/close.jpg" class="w-full h-full" />
            </div>
          </div>
        </div>
      </template>
      <div>
        <el-form ref="ruleFormRef" label-position="top" :model="ruleForm" :rules="rules" label-width="auto" class="demo-ruleForm">
          <el-form-item label="Carrie" prop="carrierCode">
            <el-select v-model="ruleForm.carrierCode" filterable placeholder="Select Carrie" clearable style="width: 100%">
              <el-option v-for="item in carrierListValid" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Trade Lane" prop="tradeLane">
            <el-select v-model="ruleForm.tradeLane" placeholder="Select Trade Lane" style="width: 100%">
              <el-option label="US" value="US" />
              <el-option label="CA" value="CA" />
            </el-select>
          </el-form-item>
          <el-form-item label="Contract Type" prop="contractType">
            <el-input placeholder="Enter contract type" v-model.trim="ruleForm.contractType" />
          </el-form-item>
          <el-form-item label="Container Type" prop="containerType">
            <el-select v-model="ruleForm.containerType" placeholder="Select Container Type" style="width: 100%">
              <el-option label="20GP" value="20GP" />
              <el-option label="40GP" value="40GP" />
              <el-option label="40HQ" value="40HQ" />
              <el-option label="45HQ" value="45HQ" />
            </el-select>
          </el-form-item>
          <el-form-item label="Business Type" prop="businessType">
            <el-select v-model="ruleForm.businessType" placeholder="Select Business Type" style="width: 100%">
              <el-option label="BASE" value="BASE" />
              <el-option label="IPI" value="IPI" />
            </el-select>
          </el-form-item>
          <el-form-item label="Service Mode" prop="serviceMode">
            <el-input placeholder="Enter service mode" v-model.trim="ruleForm.serviceMode" />
          </el-form-item>
          <el-form-item label="SVC Code" prop="svcCode">
            <el-input placeholder="Enter SVC code" v-model.trim="ruleForm.svcCode" />
          </el-form-item>
          <el-form-item label="Route" prop="route">
            <el-select v-model="ruleForm.route" filterable placeholder="Select Route" style="width: 100%" virtual :max-height="300">
              <el-option
                v-for="item in routeListValid"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Service Region" prop="serviceRegion">
            <el-select v-model="ruleForm.serviceRegion" placeholder="Select Service Region" style="width: 100%">
              <el-option label="REGION" value="REGION" />
              <el-option label="PORT" value="PORT" />
            </el-select>
          </el-form-item>
          <el-form-item label="POD Code" prop="podCode">
            <el-input placeholder="Enter POD code" v-model.trim="ruleForm.podCode" />
          </el-form-item>
          <el-form-item label="Max Net Weight (Kgs)" prop="maxNetWeightKgs">
            <el-input type="number" placeholder="Enter max net weight in kgs" v-model.number="ruleForm.maxNetWeightKgs" />
          </el-form-item>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="Valid From" prop="validFrom">
                <el-date-picker 
                  v-model="ruleForm.validFrom" 
                  type="date" 
                  value-format="YYYY-MM-DD"
                  placeholder="Select start date" 
                  style="width: 100%" 
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Valid To" prop="validTo">
                <el-date-picker 
                  v-model="ruleForm.validTo" 
                  type="date" 
                  value-format="YYYY-MM-DD"
                  placeholder="Select end date" 
                  style="width: 100%" 
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="Remarks" prop="remarks">
            <el-input type="textarea" placeholder="Enter remarks" v-model="ruleForm.remarks" rows="3" />
          </el-form-item>
          <el-form-item label="Status" prop="isValid">
            <el-radio-group v-model="ruleForm.isValid">
              <el-radio :value="0" border>Invalid</el-radio>
              <el-radio :value="1" border>Valid</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="w-full text-right">
          <el-button type="primary" class="conBtn" @click="submitForm(ruleFormRef)" :loading="loading">Confirm</el-button>
          <el-button class="closeBtn" @click="closeDialog">Close</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 阶梯表弹窗 -->
    <el-dialog v-model="ladderDialogVisible" :close-on-click-modal="false" width="550">
      <template #header>
        <div class="flex justify-between items-center">
          <span>{{ ladderDialogTitle }}</span>
          <div class="w-[16px] h-[16px] cursor-pointer" @click="ladderDialogVisible = false">
            <img src="@/assets/images/close.jpg" class="w-full h-full" />
          </div>
        </div>
      </template>
      <el-form label-position="top" :model="ladderForm" label-width="auto">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Min Weight (KG)">
              <el-input type="number" v-model.number="ladderForm.ladderMinKgs" placeholder="Min weight" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Max Weight (KG)">
              <el-input type="number" v-model.number="ladderForm.ladderMaxKgs" placeholder="Max weight (leave blank for no limit)" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Charge Type" required>
          <el-select v-model="ladderForm.chargeType" placeholder="Select charge type" style="width: 100%">
            <el-option label="FREE" value="FREE" />
            <el-option label="AT_COST" value="AT_COST" />
            <el-option label="FIXED" value="FIXED" />
            <el-option label="PERCENT" value="PERCENT" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Unit Price">
              <el-input type="number" v-model.number="ladderForm.unitPrice" placeholder="Unit price" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Min Price">
              <el-input type="number" v-model.number="ladderForm.minPrice" placeholder="Min price" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Max Price">
              <el-input type="number" v-model.number="ladderForm.maxPrice" placeholder="Max price" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Currency">
              <el-input v-model="ladderForm.currency" placeholder="USD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Unit">
              <el-select v-model="ladderForm.unit" placeholder="Select unit" style="width: 100%">
                <el-option label="CNTR" value="CNTR" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Remarks">
          <el-input type="textarea" v-model="ladderForm.remarks" rows="2" placeholder="Remarks" />
        </el-form-item>
        <el-form-item label="Status">
          <el-radio-group v-model="ladderForm.isValid">
            <el-radio :value="1">Valid</el-radio>
            <el-radio :value="0">Invalid</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="w-full text-right">
          <el-button type="primary" @click="submitLadderForm" :loading="ladderSubmitLoading">Confirm</el-button>
          <el-button @click="ladderDialogVisible = false">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.ladder-container {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.ladder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ladder-title {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.ladder-table {
  margin-top: 8px;
}

.ladder-empty {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}
</style>