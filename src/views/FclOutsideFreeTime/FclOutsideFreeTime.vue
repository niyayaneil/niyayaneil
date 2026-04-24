<script setup lang="ts">
import { onMounted, ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import { getFclOutsideFreeTimeList, addFclOutsideFreeTimeApi, editFclOutsideFreeTimeApi, patchFclOutsideFreeTimeValidApi } from '@/api/FclOutsideFreeTime'
import { getOptionsListApi } from '@/api/Public'
import type { FclOutsideFreeTimeItem, FclOutsideFreeTimeSearchParams } from '@/types/FclOutsideFreeTime'

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
})

const carrierList = ref<{ label: string; value: string | number }[]>([])
const carrierListValid = ref<{ label: string; value: string | number }[]>([])

const onSearch = () => {
  form.value.pageNum = 1
  getTableList()
}
const onReset = () => {
  form.value.carrierCode = ''
  form.value.tradeLane = ''
  form.value.contractType = ''
  form.value.businessType = ''
  form.value.containerType = ''
  form.value.route = ''
  form.value.podType = ''
  form.value.pod = ''
  form.value.ddType = ''
  form.value.isValid = undefined
  form.value.pageNum = 1
  form.value.pageSize = 30
  getTableList()
}

// 搜索
const form = ref<FclOutsideFreeTimeSearchParams>({
  pageNum: 1,
  pageSize: 30,
  customerName: '',
  carrierCode: '',
  tradeLane: '',
  contractType: '',
  businessType: '',
  containerType: '',
  route: '',
  podType: '',
  pod: '',
  ddType: '',
  isValid: undefined
})
const loading = ref(false)
const submitLoading = ref(false)

const getTableList = async () => {
  try {
    loading.value = true
    const response = await getFclOutsideFreeTimeList(form.value)
    tableData.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    ElMessage({
      type: 'error',
      message: 'Failed to get FCL outside free time list'
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

const tableData = ref<FclOutsideFreeTimeItem[]>([])

// 添加
const add = () => {
  titleDialog.value = 'New FCL Outside Free Time'
  ruleForm.value = {
    id: 0,
    customerName: '',
    carrierCode: '',
    tradeLane: '',
    contractType: '',
    businessType: '',
    containerType: '',
    route: '',
    podType: '',
    pod: '',
    ddType: '',
    freeDays: undefined,
    freeUnit: '',
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

const edit = (row: FclOutsideFreeTimeItem) => {
  titleDialog.value = 'Edit FCL Outside Free Time'
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
const rules = reactive<FormRules<FclOutsideFreeTimeItem>>({
  customerName: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  carrierCode: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  tradeLane: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  contractType: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  businessType: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  containerType: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  route: [],
  podType: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  pod: [],
  ddType: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  freeDays: [
    {
      type: 'number',
      min: 0,
      message: 'Free days must be non-negative',
      trigger: 'change',
    },
  ],
  freeUnit: [],
  remarks: [],
  isValid: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
})

const ruleForm = ref<FclOutsideFreeTimeItem>({
  id: 0,
  customerName: '',
  carrierCode: '',
  tradeLane: '',
  contractType: '',
  businessType: '',
  containerType: '',
  route: '',
  podType: '',
  pod: '',
  ddType: '',
  freeDays: undefined,
  freeUnit: '',
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
        customerName: ruleForm.value.customerName,
        carrierCode: ruleForm.value.carrierCode,
        tradeLane: ruleForm.value.tradeLane,
        contractType: ruleForm.value.contractType,
        businessType: ruleForm.value.businessType,
        containerType: ruleForm.value.containerType,
        route: ruleForm.value.route,
        podType: ruleForm.value.podType,
        pod: ruleForm.value.pod,
        ddType: ruleForm.value.ddType,
        freeDays: ruleForm.value.freeDays,
        freeUnit: ruleForm.value.freeUnit,
        remarks: ruleForm.value.remarks,
        isValid: ruleForm.value.isValid
      }
      if (titleDialog.value === 'New FCL Outside Free Time') {
        delete (formCopy as any).id
        submitLoading.value = true
        addFclOutsideFreeTimeApi(formCopy).then((res) => {
          if (res.code === 200) {
            getTableList()
            closeDialog()
            ElMessage({
              type: 'success',
              message: 'FCL outside free time added successfully',
            })
          }
        }).catch((err) => {
          console.error('Add failed:', err)
          ElMessage({
            type: 'error',
            message: 'Failed to add FCL outside free time'
          })
        }).finally(() => {
          submitLoading.value = false
        })
      } else {
        submitLoading.value = true
        editFclOutsideFreeTimeApi(formCopy).then((res) => {
          if (res.code === 200) {
            getTableList()
            closeDialog()
            ElMessage({
              type: 'success',
              message: 'FCL outside free time updated successfully',
            })
          }
        }).catch((err) => {
          console.error('Edit failed:', err)
          ElMessage({
            type: 'error',
            message: 'Failed to edit FCL outside free time'
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
const handleStatusChange = async (row: FclOutsideFreeTimeItem, newValue: number) => {
  const originalValue = newValue === 1 ? 0 : 1
  
  ElMessageBox.confirm('Please confirm this operation', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(async () => {
      try {
        await patchFclOutsideFreeTimeValidApi(row.id, newValue)
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
        <el-form-item label="Contract Type" prop="contractType">
          <el-select v-model="form.contractType" clearable placeholder="Select Contract Type" style="width: 150px">
            <el-option label="FAK" value="FAK" />
            <el-option label="FIX" value="FIX" />
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
            <el-option label="40GP" value="40GP" />
            <el-option label="40HQ" value="40HQ" />
            <el-option label="45HQ" value="45HQ" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-form
        :inline="true"
        :model="form"
        ref="ruleFormRef"
        class="demo-form-inline"
        label-position="right"
        label-width="auto"
      >
        <el-form-item label="Route" prop="route">
          <el-select v-model="form.route" clearable placeholder="Select Route" style="width: 150px">
            <el-option label="USEC" value="USEC" />
            <el-option label="USWC" value="USWC" />
            <el-option label="USGC" value="USGC" />
          </el-select>
        </el-form-item>
        <el-form-item label="POD Type" prop="podType">
          <el-select v-model="form.podType" clearable placeholder="Select POD Type" style="width: 150px">
            <el-option label="REGION" value="REGION" />
            <el-option label="PORT" value="PORT" />
          </el-select>
        </el-form-item>
        <el-form-item label="POD" prop="pod">
          <el-input v-model="form.pod" placeholder="Input" clearable />
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
          New FCL Outside Free Time</el-button
        >
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        height="calc(100vh - 240px)"
        stripe
        empty-text="No data available"
      >
        <el-table-column prop="id" label="#" width="60">
          <template #default="{ $index }">
            <div>{{ indexMethod($index) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="Customer Name" min-width="150" show-overflow-tooltip />
        <el-table-column prop="carrierCode" label="Carrie" min-width="118" show-overflow-tooltip />
        <el-table-column prop="tradeLane" label="Trade Lane" min-width="150" show-overflow-tooltip />
        <el-table-column prop="contractType" label="Contract Type" min-width="150" show-overflow-tooltip />
        <el-table-column prop="businessType" label="Business Type" min-width="100" show-overflow-tooltip />
        <el-table-column prop="containerType" label="Container Type" min-width="100" show-overflow-tooltip />
        <el-table-column prop="route" label="Route" min-width="150" show-overflow-tooltip />
        <el-table-column prop="podType" label="POD Type" min-width="100" show-overflow-tooltip />
        <el-table-column prop="pod" label="POD" min-width="150" show-overflow-tooltip />
        <el-table-column prop="ddType" label="DD Type" min-width="100" show-overflow-tooltip />
        <el-table-column prop="freeDays" label="Free Days" min-width="100" show-overflow-tooltip />
        <el-table-column prop="freeUnit" label="Free Unit" min-width="100" show-overflow-tooltip />
        <el-table-column prop="remarks" label="Remarks" min-width="150" show-overflow-tooltip />
        <el-table-column
          prop="updateUser"
          label="Updater"
          width="108"
          show-overflow-tooltip
        />
        <el-table-column
          prop="updateTime"
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
          <el-form-item label="Customer Name" prop="customerName">
            <el-input placeholder="Enter customer name" v-model.trim="ruleForm.customerName" />
          </el-form-item>

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

          <el-form-item label="Contract Type" prop="contractType">
            <el-select v-model="ruleForm.contractType" placeholder="Select Contract Type" style="width: 100%">
              <el-option label="FAK" value="FAK" />
              <el-option label="FIX" value="FIX" />
            </el-select>
          </el-form-item>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="Free Days" prop="freeDays">
                <el-input type="number" placeholder="Enter free days" v-model.number="ruleForm.freeDays" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Free Unit" prop="freeUnit">
                <el-select v-model="ruleForm.freeUnit" placeholder="Select free unit" style="width: 100%">
                  <el-option label="CD" value="CD" />
                  <el-option label="WD" value="WD" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Business Type" prop="businessType">
            <el-input placeholder="Enter business type (BASE/IPI)" v-model.trim="ruleForm.businessType" />
          </el-form-item>

          <el-form-item label="Container Type" prop="containerType">
            <el-select v-model="ruleForm.containerType" placeholder="Select Container Type" style="width: 100%">
              <el-option label="20GP" value="20GP" />
              <el-option label="40GP" value="40GP" />
              <el-option label="40HQ" value="40HQ" />
              <el-option label="45HQ" value="45HQ" />
            </el-select>
          </el-form-item>

          <el-form-item label="Route" prop="route">
            <el-select v-model="ruleForm.route" placeholder="Select Route" style="width: 100%">
              <el-option label="USEC" value="USEC" />
              <el-option label="USWC" value="USWC" />
              <el-option label="USGC" value="USGC" />
            </el-select>
          </el-form-item>

          <el-form-item label="POD Type" prop="podType">
            <el-select v-model="ruleForm.podType" placeholder="Select POD Type" style="width: 100%">
              <el-option label="REGION" value="REGION" />
              <el-option label="PORT" value="PORT" />
            </el-select>
          </el-form-item>

          <el-form-item label="POD" prop="pod">
            <el-input placeholder="Enter POD (region/port code/state list)" v-model.trim="ruleForm.pod" />
          </el-form-item>

          <el-form-item label="DD Type" prop="ddType">
            <el-select v-model="ruleForm.ddType" placeholder="Select DD Type" style="width: 100%">
              <el-option label="CONTRACT" value="CONTRACT" />
              <el-option label="PUBLISHED" value="PUBLISHED" />
            </el-select>
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
