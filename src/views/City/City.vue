<script setup lang="ts">
import { onMounted, ref, reactive, nextTick } from 'vue'
import { getCityPageApi, addCityApi, editCityApi, patchCityApi } from '@/api/City'
import { getOptionsListApi, getreadMsgApi } from '@/api/Public'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import type { BillItemSearchResultItem } from '@/types/City'
onMounted(() => {
  onSearch()
  getOptionsListApi({ countries: {} }).then((res: any) => {
    if (res.data.countries.length > 0) {
      countryList.value = res.data.countries
    }
  })
  getOptionsListApi({ countries: { isValid: '1' } }).then((res: any) => {
    if (res.data.countries.length > 0) {
      countryListValid.value = res.data.countries
    }
  })
  getOptionsListApi({ states: {} }).then((res: any) => {
    if (res.data.states.length > 0) {
      statesList.value = res.data.states
    }
  })
  getOptionsListApi({ states: { isValid: '1' } }).then((res: any) => {
    if (res.data.states.length > 0) {
      statesListValid.value = res.data.states
    }
  })
  getreadMsgApi({ isValid: '1', pageNum: 1, pageSize: 100 }).then((res: any) => {
    if (res.data.list.length > 0) {
      res.data.list.forEach((item: { code: string; content: string }) => {
        if (item.code === 'dictCities.create') {
          htmlContent.value = item.content
        }
      })
    }
  })
})
const handleCountryChange = () => {
  if (form.value.countryNumCode) {
    getOptionsListApi({ states: { countryNumCode: form.value.countryNumCode } }).then(
      (res: any) => {
        if (res.data.states.length > 0) {
          statesList.value = res.data.states
          // 如果form.stateNumCode有值，看是否在statesList中，如果不在，则清空
          if (
            form.value.stateNumCode &&
            !statesList.value.find((item) => item.value === form.value.stateNumCode)
          ) {
            form.value.stateNumCode = ''
          }
        } else {
          form.value.stateNumCode = ''
        }
      },
    )
  } else {
    getOptionsListApi({ states: {} }).then((res: any) => {
      if (res.data.states.length > 0) {
        statesList.value = res.data.states
      }
    })
  }
}
const handleCountryFormChange = () => {
  if (ruleForm.value.countryNumCode) {
    getOptionsListApi({
      states: { isValid: '1', countryNumCode: ruleForm.value.countryNumCode },
    }).then((res: any) => {
      if (res.data.states.length > 0) {
        statesListValid.value = res.data.states
        // 如果form.stateNumCode有值，看是否在statesList中，如果不在，则清空
        if (
          ruleForm.value.stateNumCode &&
          !statesListValid.value.find((item) => item.value === ruleForm.value.stateNumCode)
        ) {
          ruleForm.value.stateNumCode = ''
        }
      } else {
        ruleForm.value.stateNumCode = ''
      }
    })
  } else {
    getOptionsListApi({ states: { isValid: '1' } }).then((res: any) => {
      if (res.data.states.length > 0) {
        statesListValid.value = res.data.states
      }
    })
  }
}
const onSearch = () => {
  getTableList()
}
const onReset = () => {
  form.value.countryNumCode = ''
  form.value.stateNumCode = ''
  form.value.isValid = '1'
  form.value.pageNum = 1
  form.value.pageSize = 30
  form.value.orderBys = 'systemUpdateTimeUtc:desc'
  getOptionsListApi({ states: {} }).then((res: any) => {
    if (res.data.states.length > 0) {
      statesList.value = res.data.states
    }
  })
  getTableList()
}
const countryList = ref<{ label: string; value: string | number }[]>([])
const countryListValid = ref<{ label: string; value: string | number }[]>([])
const statesList = ref<{ label: string; value: string | number }[]>([])
const statesListValid = ref<{ label: string; value: string | number }[]>([])
// 搜索
const form = ref({
  countryNumCode: '',
  stateNumCode: '',
  isValid: '1',
  pageNum: 1,
  pageSize: 30,
  orderBys: 'systemUpdateTimeUtc:desc',
})
const orderByField = ref('systemUpdateTimeUtc')
const orderSortType = ref('descending')
// 处理排序变化
const handleSortChange = ({ prop, order }) => {
  if (!order) {
    orderByField.value = ''
    orderSortType.value = ''
    form.value.orderBys = ''
    getTableList()
  } else {
    orderByField.value = prop
    orderSortType.value = order === 'ascending' ? 'asc' : 'desc'
    form.value.orderBys = `${orderByField.value}:${orderSortType.value}`
    getTableList()
  }
}
const tableRef = ref()
const getTableList = () => {
  getCityPageApi(form.value).then((res) => {
    tableData.value = res.data.list
    total.value = res.data.total
  })
}
const indexMethod = (index: number) => {
  let current = form.value.pageNum
  let limit = form.value.pageSize
  return index + 1 + (current - 1) * limit
}
const total = ref(0)
const handlePageNumChange = (val: number) => {
  form.value.pageSize = val
  getTableList()
}
const handlePageSizeChange = (val: number) => {
  form.value.pageNum = val
  getTableList()
}
const tableData = ref<BillItemSearchResultItem[]>([])

// 添加
const add = () => {
  titleDialog.value = 'New City'
  visibleDialog.value = true
}
const edit = (row: BillItemSearchResultItem) => {
  titleDialog.value = 'Edit City'
  getOptionsListApi({
    states: { isValid: '1', countryNumCode: row.countryNumCode },
  }).then((res: any) => {
    if (res.data.states.length > 0) {
      statesListValid.value = res.data.states
    }
  })
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
const rules = reactive<FormRules<BillItemSearchResultItem>>({
  countryNumCode: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  stateNumCode: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  numCode: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  nameEn: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  nameCn: [
    {
      required: true,
      message: 'Required',
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
const ruleForm = ref<BillItemSearchResultItem>({
  id: 0,
  countryNumCode: '',
  stateNumCode: '',
  numCode: '',
  nameEn: '',
  nameCn: '',
  isValid: '1',
})
const handleStatusChange = async (row: { id: number; isValid: string }) => {
  ElMessageBox.confirm('Please confirm this operation', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning',
  })
    .then(async () => {
      row.isValid = row.isValid === '1' ? '1' : '0'
      await patchCityApi({ id: row.id, isValid: row.isValid })
      ElMessage({
        type: 'success',
        message: `Success`,
      })
      getTableList()
    })
    .catch(() => {
      row.isValid = row.isValid === '1' ? '0' : '1'
      ElMessage({
        type: 'info',
        message: 'Canceled',
      })
    })
}
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      let formCopy = JSON.parse(JSON.stringify(ruleForm.value))
      if (titleDialog.value === 'New City') {
        delete formCopy.id
        addCityApi(formCopy).then((res) => {
          if (res.data) {
            getTableList()
            closeDialog()
            ElMessage({
              type: 'success',
              message: `Success`,
            })
          }
        })
      } else {
        editCityApi(formCopy).then(() => {
          getTableList()
          closeDialog()
          ElMessage({
            type: 'success',
            message: `Success`,
          })
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
    ruleFormRef.value?.resetFields() // 清空字段并重置校验状态
  })
  getOptionsListApi({ states: { isValid: '1' } }).then((res: any) => {
    if (res.data.states.length > 0) {
      statesListValid.value = res.data.states
    }
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
        <el-form-item label="Country" prop="countryNumCode">
          <el-select
            v-model="form.countryNumCode"
            filterable
            placeholder="Please Select"
            @change="handleCountryChange"
            clearable
          >
            <el-option
              v-for="item in countryList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Provice/State" prop="stateNumCode">
          <el-select v-model="form.stateNumCode" filterable placeholder="Please Select" clearable>
            <el-option
              v-for="item in statesList"
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
        New City</el-button
      >
      <el-table
        :data="tableData"
        ref="tableRef"
        style="width: 100%"
        :default-sort="{ prop: orderByField, order: orderSortType }"
        @sort-change="handleSortChange"
        height="calc(100vh - 270px)"
        stripe
      >
        <el-table-column prop="id" label="#" width="64">
          <template #default="{ $index }">
            <div>{{ indexMethod($index) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="LD3_PK" min-width="136" show-overflow-tooltip />
        <el-table-column
          prop="countryNameEn"
          label="Country"
          min-width="118"
          show-overflow-tooltip
        />
        <el-table-column
          prop="stateNameEn"
          label="Provice/State"
          min-width="136"
          show-overflow-tooltip
        />
        <el-table-column prop="numCode" label="City Code" min-width="118" show-overflow-tooltip />
        <el-table-column prop="nameEn" label="English Name" min-width="136" show-overflow-tooltip />
        <el-table-column prop="nameCn" label="Chinese Name" min-width="136" show-overflow-tooltip />
        <el-table-column prop="isValid" label="Status" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.isValid"
              style="--el-switch-on-color: #409eff; --el-switch-off-color: #ccc"
              active-value="1"
              inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="systemUpdateUser"
          label="Updater"
          width="136"
          show-overflow-tooltip
        />
        <el-table-column
          prop="systemUpdateTimeUtc"
          sortable
          label="Update Time"
          width="156"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div>{{ row.systemUpdateTimeUtc.replace(/:\d{2}$/, '') }}</div>
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
          @size-change="handlePageNumChange"
          @current-change="handlePageSizeChange"
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
          <el-form-item label="Country" prop="countryNumCode">
            <el-select
              v-model.trim="ruleForm.countryNumCode"
              filterable
              placeholder="Please Select"
              @change="handleCountryFormChange"
              clearable
            >
              <el-option
                v-for="item in countryListValid"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-row :gutter="10">
            <el-col :span="18">
              <el-form-item label="Provice/State Code" prop="stateNumCode">
                <el-select
                  v-model="ruleForm.stateNumCode"
                  filterable
                  placeholder="Please Select"
                  clearable
                >
                  <el-option
                    v-for="item in statesListValid"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="City Code" prop="numCode">
                <el-input placeholder="Input" v-model.trim="ruleForm.numCode" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="English Name" prop="nameEn">
            <el-input placeholder="Input" v-model="ruleForm.nameEn" />
          </el-form-item>
          <el-form-item label="Chinese Name" prop="nameCn">
            <el-input placeholder="Input" v-model="ruleForm.nameCn" />
          </el-form-item>
          <el-form-item label="Status" prop="isValid">
            <el-radio-group v-model="ruleForm.isValid">
              <el-radio value="0" border>Invalid</el-radio>
              <el-radio value="1" border>Valid</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="w-full text-right">
          <el-button type="primary" class="conBtn" @click="submitForm(ruleFormRef)">
            Confirm
          </el-button>
          <el-button class="closeBtn" @click="closeDialog">Close</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
