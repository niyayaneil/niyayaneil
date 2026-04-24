<script setup lang="ts">
import { onMounted, ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import { getFclOriginChargeList, addFclOriginChargeApi, editFclOriginChargeApi, patchFclOriginChargeValidApi } from '@/api/FclOriginCharge'
import { getOptionsListApi } from '@/api/Public'
import type { FclOriginChargeItem, FclOriginChargeSearchParams } from '@/types/FclOriginCharge'

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
const portList = ref<{ label: string; value: string | number }[]>([])
const portListValid = ref<{ label: string; value: string | number }[]>([])

// 币种选项
const currencyOptions = ref<{ label: string; value: string }[]>([
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
  { label: 'THB', value: 'THB' },
  { label: 'SGD', value: 'SGD' },
  { label: 'MYR', value: 'MYR' },
  { label: 'IDR', value: 'IDR' },
  { label: 'VND', value: 'VND' }
])

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
  form.value.pageNum = 1
  getTableList()
}
const onReset = () => {
  form.value.carrierCode = ''
  form.value.agentName = ''
  form.value.polCode = ''
  form.value.feeItem = ''
  form.value.isValid = undefined
  form.value.pageNum = 1
  form.value.pageSize = 30
  getTableList()
}

// 搜索
const form = ref<FclOriginChargeSearchParams>({
  pageNum: 1,
  pageSize: 30,
  carrierCode: '',
  agentName: '',
  polCode: '',
  feeItem: '',
  isValid: undefined
})
const loading = ref(false)
const submitLoading = ref(false)

const getTableList = async () => {
  try {
    loading.value = true
    const response = await getFclOriginChargeList(form.value)
    tableData.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    ElMessage({
      type: 'error',
      message: 'Failed to get FCL origin charge list'
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

const tableData = ref<FclOriginChargeItem[]>([])

// 添加
const add = () => {
  titleDialog.value = 'New FCL Origin Charge'
  ruleForm.value = {
    id: 0,
    carrierCode: '',
    agentName: '',
    polCode: '',
    feeItem: '',
    currency: 'USD',
    fee20gp: undefined,
    fee40gp: undefined,
    fee40hq: undefined,
    fee45hq: undefined,
    fee20fl: undefined,
    fee40fl: undefined,
    fee40ot: undefined,
    fee20ot: undefined,
    fee40otq: undefined,
    fee40rq: undefined,
    fee40nor: undefined,
    fee20rf: undefined,
    fee40rf: undefined,
    flatRate: undefined,
    unit: '',
    paymentTerm: '',
    isSpecialBilling: 0,
    specialBillingRule: '',
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

const edit = (row: FclOriginChargeItem) => {
  titleDialog.value = 'Edit FCL Origin Charge'
  visibleDialog.value = true
  nextTick(() => {
    for (let key in ruleForm.value) {
      if (row.hasOwnProperty(key)) {
        ruleForm.value[key] = row[key]
      }
    }
  })
}

// 弹窗
const visibleDialog = ref(false)
const titleDialog = ref('')
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<FclOriginChargeItem>>({
  carrierCode: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  polCode: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  feeItem: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  currency: [],
  remarks: [],
  isValid: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
})

const ruleForm = ref<FclOriginChargeItem>({
  id: 0,
  carrierCode: '',
  agentName: '',
  polCode: '',
  feeItem: '',
  currency: 'USD',
  fee20gp: undefined,
  fee40gp: undefined,
  fee40hq: undefined,
  fee45hq: undefined,
  fee20fl: undefined,
  fee40fl: undefined,
  fee40ot: undefined,
  fee20ot: undefined,
  fee40otq: undefined,
  fee40rq: undefined,
  fee40nor: undefined,
  fee20rf: undefined,
  fee40rf: undefined,
  flatRate: undefined,
  unit: '',
  paymentTerm: '',
isSpecialBilling: 0,
  specialBillingRule: '',
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
      const formCopy = {
        id: ruleForm.value.id,
        carrierCode: ruleForm.value.carrierCode,
        agentName: ruleForm.value.agentName,
        polCode: ruleForm.value.polCode,
        feeItem: ruleForm.value.feeItem,
        currency: ruleForm.value.currency,
        fee20gp: ruleForm.value.fee20gp,
        fee40gp: ruleForm.value.fee40gp,
        fee40hq: ruleForm.value.fee40hq,
        fee45hq: ruleForm.value.fee45hq,
        fee20fl: ruleForm.value.fee20fl,
        fee40fl: ruleForm.value.fee40fl,
        fee40ot: ruleForm.value.fee40ot,
        fee20ot: ruleForm.value.fee20ot,
        fee40otq: ruleForm.value.fee40otq,
        fee40rq: ruleForm.value.fee40rq,
        fee40nor: ruleForm.value.fee40nor,
        fee20rf: ruleForm.value.fee20rf,
        fee40rf: ruleForm.value.fee40rf,
        flatRate: ruleForm.value.flatRate,
        unit: ruleForm.value.unit,
        paymentTerm: ruleForm.value.paymentTerm,
        isSpecialBilling: ruleForm.value.isSpecialBilling ? 1 : 0,
        specialBillingRule: ruleForm.value.specialBillingRule,
        remarks: ruleForm.value.remarks,
        isValid: ruleForm.value.isValid
      }
      if (titleDialog.value === 'New FCL Origin Charge') {
        delete (formCopy as any).id
        submitLoading.value = true
        addFclOriginChargeApi(formCopy).then((res) => {
          if (res.code === 200) {
            getTableList()
            closeDialog()
            ElMessage({
              type: 'success',
              message: 'FCL origin charge added successfully',
            })
          }
        }).catch((err) => {
          console.error('Add failed:', err)
          ElMessage({
            type: 'error',
            message: 'Failed to add FCL origin charge'
          })
        }).finally(() => {
          submitLoading.value = false
        })
      } else {
        submitLoading.value = true
        editFclOriginChargeApi(formCopy).then((res) => {
          if (res.code === 200) {
            getTableList()
            closeDialog()
            ElMessage({
              type: 'success',
              message: 'FCL origin charge updated successfully',
            })
          }
        }).catch((err) => {
          console.error('Edit failed:', err)
          ElMessage({
            type: 'error',
            message: 'Failed to edit FCL origin charge'
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
const handleStatusChange = async (row: FclOriginChargeItem, newValue: number) => {
  const originalValue = newValue === 1 ? 0 : 1

  ElMessageBox.confirm('Please confirm this operation', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(async () => {
      try {
        await patchFclOriginChargeValidApi(row.id, newValue)
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
        <el-form-item label="Agent Name" prop="agentName">
          <el-input v-model="form.agentName" placeholder="Input" clearable />
        </el-form-item>
        <el-form-item label="POL" prop="polCode">
          <el-select v-model="form.polCode" filterable placeholder="Select POL" clearable style="width: 150px" virtual :max-height="300">
            <el-option
              v-for="item in portList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Fee Item" prop="feeItem">
          <el-input v-model="form.feeItem" placeholder="Input" clearable />
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
          New FCL Origin Charge</el-button
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
        <el-table-column prop="agentName" label="Agent Name" min-width="150" show-overflow-tooltip />
        <el-table-column prop="polCode" label="POL Code" min-width="150" show-overflow-tooltip />
        <el-table-column prop="feeItem" label="Fee Item" min-width="150" show-overflow-tooltip />
        <el-table-column prop="currency" label="Currency" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee20gp" label="20GP" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee40gp" label="40GP" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee40hq" label="40HQ" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee45hq" label="45HQ" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee20fl" label="20FL" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee40fl" label="40FL" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee40ot" label="40OT" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee20ot" label="20OT" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee40otq" label="40OTQ" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee40rq" label="40RQ" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee40nor" label="40NOR" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee20rf" label="20RF" min-width="100" show-overflow-tooltip />
        <el-table-column prop="fee40rf" label="40RF" min-width="100" show-overflow-tooltip />
        <el-table-column prop="flatRate" label="Flat Rate" min-width="100" show-overflow-tooltip />
        <el-table-column prop="unit" label="Unit" min-width="100" show-overflow-tooltip />
        <el-table-column prop="paymentTerm" label="Payment Term" min-width="150" show-overflow-tooltip />
        <el-table-column prop="specialBillingRule" label="Special Billing Rule" min-width="200" show-overflow-tooltip />
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
      width="900"
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
          <el-row :gutter="24">
            <el-col :span="12">
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
            </el-col>
            <el-col :span="12">
              <el-form-item label="Agent Name" prop="agentName">
                <el-input placeholder="Enter agent name" v-model.trim="ruleForm.agentName" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="POL" prop="polCode">
                <el-select v-model="ruleForm.polCode" filterable placeholder="Select POL" clearable style="width: 100%" virtual :max-height="300">
                  <el-option
                    v-for="item in portListValid"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Fee Item" prop="feeItem">
                <el-input placeholder="Enter fee item" v-model.trim="ruleForm.feeItem" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="Currency" prop="currency">
                <el-select v-model="ruleForm.currency" placeholder="Select Currency" style="width: 100%">
                  <el-option
                    v-for="item in currencyOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">Container Rates</el-divider>

          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="20GP" prop="fee20gp">
                <el-input type="number" placeholder="Enter 20GP" v-model.number="ruleForm.fee20gp" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="40GP" prop="fee40gp">
                <el-input type="number" placeholder="Enter 40GP" v-model.number="ruleForm.fee40gp" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="40HQ" prop="fee40hq">
                <el-input type="number" placeholder="Enter 40HQ" v-model.number="ruleForm.fee40hq" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="45HQ" prop="fee45hq">
                <el-input type="number" placeholder="Enter 45HQ" v-model.number="ruleForm.fee45hq" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="20FL" prop="fee20fl">
                <el-input type="number" placeholder="Enter 20FL" v-model.number="ruleForm.fee20fl" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="40FL" prop="fee40fl">
                <el-input type="number" placeholder="Enter 40FL" v-model.number="ruleForm.fee40fl" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="40OT" prop="fee40ot">
                <el-input type="number" placeholder="Enter 40OT" v-model.number="ruleForm.fee40ot" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="20OT" prop="fee20ot">
                <el-input type="number" placeholder="Enter 20OT" v-model.number="ruleForm.fee20ot" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="40OTQ" prop="fee40otq">
                <el-input type="number" placeholder="Enter 40OTQ" v-model.number="ruleForm.fee40otq" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="40RQ" prop="fee40rq">
                <el-input type="number" placeholder="Enter 40RQ" v-model.number="ruleForm.fee40rq" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="40NOR" prop="fee40nor">
                <el-input type="number" placeholder="Enter 40NOR" v-model.number="ruleForm.fee40nor" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="20RF" prop="fee20rf">
                <el-input type="number" placeholder="Enter 20RF" v-model.number="ruleForm.fee20rf" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="40RF" prop="fee40rf">
                <el-input type="number" placeholder="Enter 40RF" v-model.number="ruleForm.fee40rf" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Flat Rate" prop="flatRate">
                <el-input type="number" placeholder="Enter Flat Rate" v-model.number="ruleForm.flatRate" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Unit" prop="unit">
                <el-input placeholder="Enter Unit" v-model.trim="ruleForm.unit" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">Other Information</el-divider>

          <el-form-item label="Payment Term" prop="paymentTerm">
            <el-input type="textarea" placeholder="Enter Payment Term" v-model="ruleForm.paymentTerm" rows="2" />
          </el-form-item>

<el-form-item label="Special Billing" prop="isSpecialBilling">
  <el-radio-group v-model="ruleForm.isSpecialBilling">
    <el-radio :value="0" border>No</el-radio>
    <el-radio :value="1" border>Yes</el-radio>
  </el-radio-group>
</el-form-item>

          <el-form-item label="Special Billing Rule" prop="specialBillingRule">
            <el-input type="textarea" placeholder="Enter Special Billing Rule" v-model="ruleForm.specialBillingRule" rows="3" />
          </el-form-item>

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