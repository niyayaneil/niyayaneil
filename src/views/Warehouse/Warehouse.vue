<script setup lang="ts">
import { onMounted, ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import { getWarehouseList, addWarehouseApi, editWarehouseApi, patchWarehouseValidApi } from '@/api/Warehouse'
import type { WarehouseItem, WarehouseSearchParams } from '@/types/Warehouse'
import { getOptionsListApi } from '@/api/Public'

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

onMounted(() => {
  getTableList()
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

const portList = ref<{ label: string; value: string | number }[]>([])
const portListValid = ref<{ label: string; value: string | number }[]>([])

const onSearch = () => {
  form.value.pageNum = 1
  getTableList()
}
const onReset = () => {
  form.value.warehouseNameEn = ''
  form.value.warehouseCode = ''
  form.value.portCode = ''
  form.value.portRole = ''
  form.value.warehouseType = ''
  form.value.address = ''
  form.value.address2 = ''
  form.value.isValid = undefined
  form.value.pageNum = 1
  form.value.pageSize = 30
  getTableList()
}

// 搜索
const form = ref<WarehouseSearchParams>({
  pageNum: 1,
  pageSize: 30,
  warehouseCode: '',
  warehouseNameEn: '',
  warehouseNameCn: '',
  portCode: '',
  portRole: '',
  warehouseType: '',
  address: '',
  address2: '',
  isValid: undefined
})
const orderByField = ref('updateTime')
const orderSortType = ref('descending')
const loading = ref(false)
const submitLoading = ref(false)
// 处理排序变化
const handleSortChange = ({ prop, order }) => {
  if (!order) {
    orderByField.value = ''
    orderSortType.value = ''
    getTableList()
  } else {
    orderByField.value = prop
    orderSortType.value = order === 'ascending' ? 'asc' : 'desc'
    getTableList()
  }
}

const getTableList = async () => {
  try {
    loading.value = true
    const response = await getWarehouseList(form.value)
    tableData.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    ElMessage({
      type: 'error',
      message: 'Failed to get warehouse list'
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

const tableData = ref<WarehouseItem[]>([])

// 添加
const add = () => {
  titleDialog.value = 'New Warehouse'
  ruleForm.value = {
    id: 0,
    warehouseCode: '',
    warehouseNameEn: '',
    warehouseNameCn: '',
    portCode: '',
    portRole: '',
    warehouseType: '',
    address: '',
    address2: '',
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

const edit = (row: WarehouseItem) => {
  titleDialog.value = 'Edit Warehouse'
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
const rules = reactive<FormRules<WarehouseItem>>({
  warehouseCode: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  warehouseNameEn: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  warehouseNameCn: [],
  portCode: [],
  portRole: [
    {
      required: true,
      message: 'Please select port role',
      trigger: 'change',
    },
  ],
  warehouseType: [
    {
      required: true,
      message: 'Please select warehouse type',
      trigger: 'change',
    },
  ],
  isValid: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
})

const ruleForm = ref<WarehouseItem>({
  id: 0,
  warehouseCode: '',
  warehouseNameEn: '',
  warehouseNameCn: '',
  portCode: '',
  portRole: '',
  warehouseType: '',
  address: '',
  address2: '',
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
        warehouseCode: ruleForm.value.warehouseCode,
        warehouseNameEn: ruleForm.value.warehouseNameEn,
        warehouseNameCn: ruleForm.value.warehouseNameCn,
        portCode: ruleForm.value.portCode,
        portRole: ruleForm.value.portRole,
        warehouseType: ruleForm.value.warehouseType,
        address: ruleForm.value.address,
        address2: ruleForm.value.address2,
        isValid: ruleForm.value.isValid
      }
      if (titleDialog.value === 'New Warehouse') {
        delete formCopy.id
        submitLoading.value = true
        addWarehouseApi(formCopy).then((res) => {
          if (res.code === 200) {
            getTableList()
            closeDialog()
            ElMessage({
              type: 'success',
              message: 'Warehouse added successfully',
            })
          }
        }).catch((err) => {
          console.error('Add failed:', err)
          ElMessage({
            type: 'error',
            message: 'Failed to add warehouse'
          })
        }).finally(() => {
          submitLoading.value = false
        })
      } else {
        submitLoading.value = true
        editWarehouseApi(formCopy).then((res) => {
          if (res.code === 200) {
            getTableList()
            closeDialog()
            ElMessage({
              type: 'success',
              message: 'Warehouse updated successfully',
            })
          }
        }).catch((err) => {
          console.error('Edit failed:', err)
          ElMessage({
            type: 'error',
            message: 'Failed to edit warehouse'
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
const handleStatusChange = async (row: WarehouseItem, newValue: number) => {
  const originalValue = newValue === 1 ? 0 : 1
  
  ElMessageBox.confirm('Please confirm this operation', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(async () => {
      try {
        await patchWarehouseValidApi(row.id, newValue)
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
        <el-form-item label="Warehouse name (EN)" prop="warehouseNameEn">
          <el-input v-model="form.warehouseNameEn" placeholder="Input" clearable />
        </el-form-item>
        <el-form-item label="Warehouse code" prop="warehouseCode">
          <el-input v-model="form.warehouseCode" placeholder="Input" clearable />
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
        <el-form-item label="Port Role" prop="portRole">
          <el-select v-model="form.portRole" clearable placeholder="Select port role" style="width: 150px">
            <el-option label="POL" value="POL" />
            <el-option label="POD" value="POD" />
          </el-select>
        </el-form-item>
        <el-form-item label="Warehouse Type" prop="warehouseType">
          <el-select v-model="form.warehouseType" clearable placeholder="Select warehouse type" style="width: 150px">
            <el-option label="CFS" value="CFS" />
            <el-option label="LCL" value="LCL" />
            <el-option label="AIR" value="AIR" />
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
          New Warehouse</el-button
        >
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        :default-sort="{ prop: orderByField, order: orderSortType }"
        @sort-change="handleSortChange"
        height="calc(100vh - 240px)"
        stripe
        empty-text="No data available"
      >
        <el-table-column prop="id" label="#" width="60">
          <template #default="{ $index }">
            <div>{{ indexMethod($index) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="warehouseNameEn" label="Warehouse name (EN)" min-width="150" show-overflow-tooltip />
        <el-table-column prop="warehouseNameCn" label="Warehouse name (CN)" min-width="150" show-overflow-tooltip />
        <el-table-column prop="warehouseCode" label="Warehouse code" min-width="118" show-overflow-tooltip />
        <el-table-column prop="portCode" label="Port Code" min-width="118" show-overflow-tooltip />
        <el-table-column prop="portRole" label="Port Role" min-width="118" show-overflow-tooltip />
        <el-table-column prop="warehouseType" label="Warehouse Type" min-width="118" show-overflow-tooltip />
        <el-table-column prop="address" label="Address" min-width="150" show-overflow-tooltip />
        <el-table-column prop="address2" label="Address 2" min-width="150" show-overflow-tooltip />
        <el-table-column
          prop="updateUser"
          label="Updater"
          width="108"
          show-overflow-tooltip
        />
        <el-table-column
          prop="updateTime"
          sortable
          label="Update Time"
          width="156"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div>{{ row.updateTime }}</div>
          </template>
        </el-table-column>

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
          <el-form-item label="Warehouse code" prop="warehouseCode">
            <el-input placeholder="Enter warehouse code" v-model.trim="ruleForm.warehouseCode" />
          </el-form-item>

          <el-form-item label="Warehouse name (EN)" prop="warehouseNameEn">
            <el-input placeholder="Enter warehouse name (EN)" v-model="ruleForm.warehouseNameEn" />
          </el-form-item>

          <el-form-item label="Warehouse name (CN)" prop="warehouseNameCn">
            <el-input placeholder="Enter warehouse name (CN)" v-model="ruleForm.warehouseNameCn" />
          </el-form-item>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="Port Role" prop="portRole">
                <el-select v-model="ruleForm.portRole" placeholder="Select port role" style="width: 100%">
                  <el-option label="POL" value="POL" />
                  <el-option label="POD" value="POD" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Warehouse Type" prop="warehouseType">
                <el-select v-model="ruleForm.warehouseType" placeholder="Select warehouse type" style="width: 100%">
                  <el-option label="CFS" value="CFS" />
                  <el-option label="LCL" value="LCL" />
                  <el-option label="AIR" value="AIR" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Port Code" prop="portCode">
            <el-select v-model="ruleForm.portCode" filterable placeholder="Select Port Code" clearable style="width: 100%" virtual :max-height="300">
              <el-option
                v-for="item in portListValid"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Address" prop="address">
            <el-input placeholder="Enter Address" v-model="ruleForm.address" />
          </el-form-item>

          <el-form-item label="Address 2" prop="address2">
            <el-input placeholder="Enter Address 2" v-model="ruleForm.address2" />
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