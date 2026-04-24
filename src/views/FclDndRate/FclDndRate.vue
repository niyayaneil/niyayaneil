<script setup lang="ts">
import { onMounted, ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import { getFclDndRateList, addFclDndRateApi, editFclDndRateApi, patchFclDndRateValidApi } from '@/api/FclDndRate'
import { getOptionsListApi } from '@/api/Public'
import type { FclDndRateItem, FclDndRateSearchParams } from '@/types/FclDndRate'

// 缓存相关配置
const CACHE_KEY = 'port_list_cache'
const CACHE_VALID_KEY = 'port_list_valid_cache'
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
const containerTypeArray = ref<string[]>([])
const portList = ref<{ label: string; value: string | number }[]>([])
const portListValid = ref<{ label: string; value: string | number }[]>([])

onMounted(() => {
  getTableList()
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
  // 获取港口列表（带缓存和请求优化）
  if (isCacheValid(CACHE_KEY)) {
    portList.value = getFromCache(CACHE_KEY)
  } else {
    // 添加超时和错误处理
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超时

    getOptionsListApi({ globalPorts: {} }, { signal: controller.signal })
      .then((res: any) => {
        clearTimeout(timeoutId)
        if (res.data && res.data.globalPorts && res.data.globalPorts.length > 0) {
          portList.value = res.data.globalPorts
          saveToCache(CACHE_KEY, res.data.globalPorts)
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          console.log('Port list request timeout')
          // 使用缓存数据作为 fallback
          if (getFromCache(CACHE_KEY).length > 0) {
            portList.value = getFromCache(CACHE_KEY)
          }
        } else {
          console.error('Error fetching port list:', error)
        }
      })
  }

  // 获取有效港口列表（带缓存和请求优化）
  if (isCacheValid(CACHE_VALID_KEY)) {
    portListValid.value = getFromCache(CACHE_VALID_KEY)
  } else {
    // 添加超时和错误处理
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3秒超时

    getOptionsListApi({ globalPorts: { isValid: '1' } }, { signal: controller.signal })
      .then((res: any) => {
        clearTimeout(timeoutId)
        if (res.data && res.data.globalPorts && res.data.globalPorts.length > 0) {
          portListValid.value = res.data.globalPorts
          saveToCache(CACHE_VALID_KEY, res.data.globalPorts)
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          console.log('Valid port list request timeout')
          // 使用缓存数据作为 fallback
          if (getFromCache(CACHE_VALID_KEY).length > 0) {
            portListValid.value = getFromCache(CACHE_VALID_KEY)
          }
        } else {
          console.error('Error fetching valid port list:', error)
        }
      })
  }
})

const onSearch = () => {
  getTableList()
}
const onReset = () => {
  form.value.carrierCode = ''
  form.value.tradeLane = ''
  form.value.chargeType = ''
  form.value.businessType = ''
  form.value.portCode = ''
  form.value.containerType = ''
  form.value.isValid = undefined
  form.value.pageNum = 1
  form.value.pageSize = 30
  getTableList()
}

// 搜索
const form = ref<FclDndRateSearchParams>({
  pageNum: 1,
  pageSize: 30,
  carrierCode: '',
  tradeLane: '',
  chargeType: '',
  businessType: '',
  portCode: '',
  containerType: '',
  isValid: undefined
})
const loading = ref(false)
const submitLoading = ref(false)

const getTableList = async () => {
  try {
    loading.value = true
    const response = await getFclDndRateList(form.value)
    tableData.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    ElMessage({
      type: 'error',
      message: 'Failed to get FCL DND rate list'
    })
  } finally {
    loading.value = false
  }
}

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

const tableData = ref<FclDndRateItem[]>([])

// 添加
const add = () => {
  titleDialog.value = 'New FCL DND Rate'
  ruleForm.value = {
    id: 0,
    carrierCode: '',
    tradeLane: '',
    chargeType: '',
    businessType: '',
    portCode: '',
    containerType: '',
    freeDays: '',
    freeUnit: '',
    freeDaysRule: '',
    specialRule: '',
    tier1Days: '',
    tier1Rate: undefined,
    tier2Days: '',
    tier2Rate: undefined,
    tier3Days: '',
    tier3Rate: undefined,
    tier4Days: '',
    tier4Rate: undefined,
    currency: 'USD',
    remarks: '',
    validFrom: '',
    validTo: '',
    createTime: '',
    createUser: '',
    updateTime: '',
    updateUser: '',
    isValid: 1
  }
  // 清空容器类型数组
  containerTypeArray.value = []
  nextTick(() => {
    ruleFormRef.value?.clearValidate()
  })
  visibleDialog.value = true
}

const edit = (row: FclDndRateItem) => {
  titleDialog.value = 'Edit FCL DND Rate'
  visibleDialog.value = true
  nextTick(() => {
    for (let key in ruleForm.value) {
      if (row.hasOwnProperty(key)) {
        ruleForm.value[key] = row[key]
      }
    }
    // 将逗号分隔的容器类型字符串转换为数组
    if (row.containerType) {
      containerTypeArray.value = row.containerType.split(',')
    } else {
      containerTypeArray.value = []
    }
  })
}

// 弹窗
const visibleDialog = ref(false)
const titleDialog = ref('')
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<FclDndRateItem>>({
  carrierCode: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  tradeLane: [],
  chargeType: [],
  businessType: [],
  portCode: [],
  containerType: [],
  freeDays: [],
  freeUnit: [],
  freeDaysRule: [],
  specialRule: [],
  tier1Days: [],
  tier1Rate: [
    {
      type: 'number',
      min: 0,
      message: 'Rate must be non-negative',
      trigger: 'change',
    },
  ],
  tier2Days: [],
  tier2Rate: [
    {
      type: 'number',
      min: 0,
      message: 'Rate must be non-negative',
      trigger: 'change',
    },
  ],
  tier3Days: [],
  tier3Rate: [
    {
      type: 'number',
      min: 0,
      message: 'Rate must be non-negative',
      trigger: 'change',
    },
  ],
  tier4Days: [],
  tier4Rate: [
    {
      type: 'number',
      min: 0,
      message: 'Rate must be non-negative',
      trigger: 'change',
    },
  ],
  currency: [],
  remarks: [],
  validFrom: [],
  validTo: [],
  isValid: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
})

const ruleForm = ref<FclDndRateItem>({
  id: 0,
  carrierCode: '',
  tradeLane: '',
  chargeType: '',
  businessType: '',
  portCode: '',
  containerType: '',
  freeDays: '',
  freeUnit: '',
  freeDaysRule: '',
  specialRule: '',
  tier1Days: '',
  tier1Rate: undefined,
  tier2Days: '',
  tier2Rate: undefined,
  tier3Days: '',
  tier3Rate: undefined,
  tier4Days: '',
  tier4Rate: undefined,
  currency: 'USD',
  remarks: '',
  validFrom: '',
  validTo: '',
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
      // 格式化日期时间，返回不带 T 的本地时间格式
      const formatDateTime = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }

      const formCopy = {
        id: ruleForm.value.id,
        carrierCode: ruleForm.value.carrierCode,
        tradeLane: ruleForm.value.tradeLane,
        chargeType: ruleForm.value.chargeType,
        businessType: ruleForm.value.businessType,
        portCode: ruleForm.value.portCode,
        containerType: containerTypeArray.value.join(','),
        freeDays: ruleForm.value.freeDays,
        freeUnit: ruleForm.value.freeUnit,
        freeDaysRule: ruleForm.value.freeDaysRule,
        specialRule: ruleForm.value.specialRule,
        tier1Days: ruleForm.value.tier1Days,
        tier1Rate: ruleForm.value.tier1Rate,
        tier2Days: ruleForm.value.tier2Days,
        tier2Rate: ruleForm.value.tier2Rate,
        tier3Days: ruleForm.value.tier3Days,
        tier3Rate: ruleForm.value.tier3Rate,
        tier4Days: ruleForm.value.tier4Days,
        tier4Rate: ruleForm.value.tier4Rate,
        currency: ruleForm.value.currency,
        remarks: ruleForm.value.remarks,
        validFrom: formatDateTime(ruleForm.value.validFrom),
        validTo: formatDateTime(ruleForm.value.validTo),
        isValid: ruleForm.value.isValid
      }
      if (titleDialog.value === 'New FCL DND Rate') {
        delete (formCopy as any).id
        submitLoading.value = true
        addFclDndRateApi(formCopy).then((res) => {
          if (res.code === 200) {
            getTableList()
            closeDialog()
            ElMessage({
              type: 'success',
              message: 'FCL DND rate added successfully',
            })
          }
        }).catch((err) => {
          console.error('Add failed:', err)
          ElMessage({
            type: 'error',
            message: 'Failed to add FCL DND rate'
          })
        }).finally(() => {
          submitLoading.value = false
        })
      } else {
        submitLoading.value = true
        editFclDndRateApi(formCopy).then((res) => {
          if (res.code === 200) {
            getTableList()
            closeDialog()
            ElMessage({
              type: 'success',
              message: 'FCL DND rate updated successfully',
            })
          }
        }).catch((err) => {
          console.error('Edit failed:', err)
          ElMessage({
            type: 'error',
            message: 'Failed to edit FCL DND rate'
          })
        }).finally(() => {
          submitLoading.value = false
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

// 状态切换
const handleStatusChange = async (row: FclDndRateItem, newValue: number) => {
  const originalValue = newValue === 1 ? 0 : 1

  ElMessageBox.confirm('Please confirm this operation', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(async () => {
      try {
        await patchFclDndRateValidApi(row.id, newValue)
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

const htmlContent = ref(``)
</script>

<template>
  <div class="mt-[3px]">
    <div class="p-[24px] bg-white">
      <el-form
        :inline="true"
        :model="form"
        ref="ruleFormRef"
        class="demo-form-inline"
        label-position="right"
        label-width="auto"
      >
        <el-form-item label="Carrie" prop="carrierCode">
          <el-select v-model="form.carrierCode" filterable placeholder="Select Carrier Code" clearable style="width: 150px">
            <el-option
              v-for="item in carrierList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Trade Lane" prop="tradeLane">
          <el-select v-model="form.tradeLane" clearable placeholder="Select Trade Lane" style="width: 150px">
            <el-option label="US" value="US" />
            <el-option label="CA" value="CA" />
          </el-select>
        </el-form-item>
        <el-form-item label="Charge Type" prop="chargeType">
          <el-select v-model="form.chargeType" clearable placeholder="Select Charge Type" style="width: 150px">
            <el-option label="Demurrage" value="Demurrage" />
            <el-option label="Detention" value="Detention" />
            <el-option label="DND" value="DND" />
          </el-select>
        </el-form-item>
        <el-form-item label="Business Type" prop="businessType">
          <el-select v-model="form.businessType" clearable placeholder="Select Business Type" style="width: 150px">
            <el-option label="BASE" value="BASE" />
            <el-option label="IPI" value="IPI" />
          </el-select>
        </el-form-item>
        <el-form-item label="Container Type" prop="containerType">
          <el-select v-model="form.containerType" clearable placeholder="Select Container Type" style="width: 150px">
            <el-option label="20GP" value="20GP" />
            <el-option label="20RF" value="20RF" />
            <el-option label="20OT" value="20OT" />
            <el-option label="20FR" value="20FR" />
            <el-option label="20TK" value="20TK" />
            <el-option label="20PL" value="20PL" />
            <el-option label="40GP" value="40GP" />
            <el-option label="40HQ" value="40HQ" />
            <el-option label="45HQ" value="45HQ" />
            <el-option label="40RF" value="40RF" />
            <el-option label="40RH" value="40RH" />
            <el-option label="40OT" value="40OT" />
            <el-option label="40FR" value="40FR" />
            <el-option label="40TK" value="40TK" />
            <el-option label="40PL" value="40PL" />
            <el-option label="53HC" value="53HC" />
          </el-select>
        </el-form-item>
        <el-form-item label="Port" prop="portCode">
          <el-select v-model="form.portCode" filterable placeholder="Select Port" clearable style="width: 150px" virtual :max-height="300">
            <el-option
              v-for="item in portList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Status" prop="isValid">
          <el-select v-model="form.isValid" clearable placeholder="Please Select">
            <el-option label="Valid" value="1"></el-option>
            <el-option label="Invalid" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" class="bg-[#2D8AE0]">Search</el-button>
          <el-button @click="onReset">Reset</el-button>
        </el-form-item>
      </el-form>
      <div class="flex">
        <el-button
          @click="add"
          class="flex h-[33px] text-[#fff] mb-[12px] text-[14px] px-4 justify-center items-center gap-6 rounded-[4px] bg-[#2D8AE0]"
          ><div class="w-[14px] h-[14px] mr-[8px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7 1.3125C6.75838 1.3125 6.5625 1.50838 6.5625 1.75V6.5625H1.75C1.50838 6.5625 1.3125 6.75838 1.3125 7C1.3125 7.24162 1.50838 7.4375 1.75 7.4375H6.5625V12.25C6.5625 12.4916 6.75838 12.6875 7 12.6875C7.24162 12.6875 7.4375 12.4916 7.4375 12.25V7.4375H12.25C12.4916 7.4375 12.6875 7.24162 12.6875 7C12.6875 6.75838 12.4916 6.5625 12.25 6.5625H7.4375V1.75C7.4375 1.50838 7.24162 1.3125 7 1.3125Z"
                fill="white"
              />
            </svg>
          </div>
          New FCL DND Rate</el-button
        >
      </div>
      <div style="width: 100%; margin-bottom: 10px;">
        <div style="overflow-x: auto; width: 100%; scrollbar-width: thin; max-height: calc(100vh - 320px);">
          <div style="min-width: 3500px;">
            <el-table
              v-loading="loading"
              :data="tableData"
              style="width: 100%"
              stripe
              empty-text="No data available"
            >
        <el-table-column prop="id" label="#" width="60">
          <template #default="{ $index }">
            <div>{{ indexMethod($index) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="carrierCode" label="Carrie" min-width="118" show-overflow-tooltip />
        <el-table-column prop="tradeLane" label="Trade Lane" min-width="150" show-overflow-tooltip />
        <el-table-column prop="chargeType" label="Charge Type" min-width="150" show-overflow-tooltip />
        <el-table-column prop="businessType" label="Business Type" min-width="100" show-overflow-tooltip />
        <el-table-column prop="portCode" label="Port Code" min-width="150" show-overflow-tooltip />
        <el-table-column prop="containerType" label="Container Type" min-width="150" show-overflow-tooltip />
        <el-table-column prop="freeDays" label="Free Days" min-width="100" show-overflow-tooltip />
        <el-table-column prop="freeUnit" label="Free Unit" min-width="100" show-overflow-tooltip />
        <el-table-column prop="freeDaysRule" label="Free Days Rule" min-width="150" show-overflow-tooltip />
        <el-table-column prop="specialRule" label="Special Rule" min-width="150" show-overflow-tooltip />
        <el-table-column prop="tier1Days" label="Tier 1 Days" min-width="100" show-overflow-tooltip />
        <el-table-column prop="tier1Rate" label="Tier 1 Rate" min-width="100" show-overflow-tooltip />
        <el-table-column prop="tier2Days" label="Tier 2 Days" min-width="100" show-overflow-tooltip />
        <el-table-column prop="tier2Rate" label="Tier 2 Rate" min-width="100" show-overflow-tooltip />
        <el-table-column prop="tier3Days" label="Tier 3 Days" min-width="100" show-overflow-tooltip />
        <el-table-column prop="tier3Rate" label="Tier 3 Rate" min-width="100" show-overflow-tooltip />
        <el-table-column prop="tier4Days" label="Tier 4 Days" min-width="100" show-overflow-tooltip />
        <el-table-column prop="tier4Rate" label="Tier 4 Rate" min-width="100" show-overflow-tooltip />
        <el-table-column prop="currency" label="Currency" min-width="100" show-overflow-tooltip />
        <el-table-column prop="validFrom" label="Valid From" min-width="150" show-overflow-tooltip />
        <el-table-column prop="validTo" label="Valid To" min-width="150" show-overflow-tooltip />
        <el-table-column prop="updateUser" label="Updater" min-width="100" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="Update Time" min-width="150" show-overflow-tooltip />
        <el-table-column prop="remarks" label="Remarks" min-width="150" show-overflow-tooltip />

        <el-table-column prop="isValid" label="Status" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.isValid"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="" min-width="60">
          <template #default="{ row }">
            <div class="w-[16px] h-[16px] cursor-pointer" @click="edit(row)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M7.37704 2.62305L4.31409 2.62305C3.87712 2.62305 3.45805 2.79663 3.14907 3.10561C2.84009 3.4146 2.6665 3.83367 2.6665 4.27063V11.6848C2.6665 12.1217 2.84009 12.5408 3.14907 12.8498C3.45805 13.1588 3.87712 13.3324 4.31409 13.3324H11.7282C12.1652 13.3324 12.5843 13.1588 12.8933 12.8498C13.2022 12.5408 13.3758 12.1217 13.3758 11.6848V8.87645"
                  stroke="#2D8AE0"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M13.7224 4.08671C13.9624 3.84674 14.0972 3.52128 14.0972 3.18191C14.0972 2.84255 13.9624 2.51709 13.7224 2.27712C13.4824 2.03716 13.157 1.90234 12.8176 1.90234C12.4782 1.90234 12.1528 2.03716 11.9128 2.27712L6.78564 7.386V9.21387H8.61351L13.7224 4.08671Z"
                  stroke="#2D8AE0"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M11.0508 3.12109L12.8786 4.94896"
                  stroke="#2D8AE0"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
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
          layout="sizes, prev, pager, next"
          :total="total"
          @size-change="handlePageSizeChange"
          @current-change="handlePageNumChange"
        />
      </div>
    </div>
    <el-dialog
      v-model="visibleDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="680"
    >
      <template #header="{ titleId, titleClass }">
        <div class="flex justify-between">
          <div :id="titleId" :class="titleClass">{{ titleDialog }}</div>
          <div class="flex items-center">
            <el-tooltip placement="bottom-end" effect="light" popper-class="mark">
              <template #content>
                <div v-html="htmlContent"></div>
              </template>
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
        <el-form
          ref="ruleFormRef"
          label-position="top"
          :model="ruleForm"
          :rules="rules"
          label-width="auto"
          class="demo-ruleForm"
        >
          <el-form-item label="Carrie" prop="carrierCode">
            <el-select v-model="ruleForm.carrierCode" filterable placeholder="Select Carrier Code" clearable style="width: 100%">
              <el-option
                v-for="item in carrierListValid"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Trade Lane" prop="tradeLane">
            <el-select v-model="ruleForm.tradeLane" placeholder="Select Trade Lane" style="width: 100%">
              <el-option label="US" value="US" />
              <el-option label="CA" value="CA" />
            </el-select>
          </el-form-item>

          <el-form-item label="Charge Type" prop="chargeType">
            <el-select v-model="ruleForm.chargeType" placeholder="Select Charge Type" style="width: 100%">
              <el-option label="Demurrage" value="Demurrage" />
              <el-option label="Detention" value="Detention" />
              <el-option label="DND" value="DND" />
            </el-select>
          </el-form-item>

          <el-form-item label="Business Type" prop="businessType">
            <el-select v-model="ruleForm.businessType" placeholder="Select Business Type" style="width: 100%">
              <el-option label="BASE" value="BASE" />
              <el-option label="IPI" value="IPI" />
            </el-select>
          </el-form-item>

          <el-form-item label="Port" prop="portCode">
            <el-select v-model="ruleForm.portCode" filterable placeholder="Select Port" clearable style="width: 100%" virtual :max-height="300">
              <el-option
                v-for="item in portListValid"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Container Type" prop="containerType">
            <el-select v-model="containerTypeArray" multiple placeholder="Select Container Type" style="width: 100%">
              <el-option label="20GP" value="20GP" />
              <el-option label="20RF" value="20RF" />
              <el-option label="20OT" value="20OT" />
              <el-option label="20FR" value="20FR" />
              <el-option label="20TK" value="20TK" />
              <el-option label="20PL" value="20PL" />
              <el-option label="40GP" value="40GP" />
              <el-option label="40HQ" value="40HQ" />
              <el-option label="45HQ" value="45HQ" />
              <el-option label="40RF" value="40RF" />
              <el-option label="40RH" value="40RH" />
              <el-option label="40OT" value="40OT" />
              <el-option label="40FR" value="40FR" />
              <el-option label="40TK" value="40TK" />
              <el-option label="40PL" value="40PL" />
              <el-option label="53HC" value="53HC" />
            </el-select>
          </el-form-item>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="Free Days" prop="freeDays">
                <el-input placeholder="Enter free days" v-model.trim="ruleForm.freeDays" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Free Unit" prop="freeUnit">
                <el-input placeholder="Enter free unit (WD/CD)" v-model.trim="ruleForm.freeUnit" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Free Days Rule" prop="freeDaysRule">
            <el-input placeholder="Enter free days rule" v-model.trim="ruleForm.freeDaysRule" />
          </el-form-item>

          <el-form-item label="Special Rule" prop="specialRule">
            <el-input placeholder="Enter special rule" v-model.trim="ruleForm.specialRule" />
          </el-form-item>

          <el-form-item label="Tier 1" prop="tier1Days">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-input placeholder="Enter days (e.g. 1-5)" v-model.trim="ruleForm.tier1Days" />
              </el-col>
              <el-col :span="12">
                <el-input type="number" placeholder="Enter rate" v-model.number="ruleForm.tier1Rate" />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="Tier 2" prop="tier2Days">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-input placeholder="Enter days (e.g. 6+)" v-model.trim="ruleForm.tier2Days" />
              </el-col>
              <el-col :span="12">
                <el-input type="number" placeholder="Enter rate" v-model.number="ruleForm.tier2Rate" />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="Tier 3" prop="tier3Days">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-input placeholder="Enter days" v-model.trim="ruleForm.tier3Days" />
              </el-col>
              <el-col :span="12">
                <el-input type="number" placeholder="Enter rate" v-model.number="ruleForm.tier3Rate" />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="Tier 4" prop="tier4Days">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-input placeholder="Enter days" v-model.trim="ruleForm.tier4Days" />
              </el-col>
              <el-col :span="12">
                <el-input type="number" placeholder="Enter rate" v-model.number="ruleForm.tier4Rate" />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="Currency" prop="currency">
            <el-input placeholder="Enter currency" v-model.trim="ruleForm.currency" />
          </el-form-item>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="Valid From" prop="validFrom">
                <el-date-picker
                  v-model="ruleForm.validFrom"
                  type="datetime"
                  placeholder="Select start datetime"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Valid To" prop="validTo">
                <el-date-picker
                  v-model="ruleForm.validTo"
                  type="datetime"
                  placeholder="Select end datetime"
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
          <el-button type="primary" class="conBtn" @click="submitForm(ruleFormRef)" :loading="submitLoading">
            Confirm
          </el-button>
          <el-button class="closeBtn" @click="closeDialog">Close</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
