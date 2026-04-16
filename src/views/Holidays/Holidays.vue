<script setup lang="ts">
import { onMounted, ref, reactive, nextTick } from 'vue'
import { getHolidayPageApi, editHolidayApi, deleteHolidayApi } from '@/api/Holidays'
import { getOptionsListApi, getreadMsgApi } from '@/api/Public'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import type { BillItemSearchResultItem } from '@/types/Holidays'
onMounted(() => {
  getTableList()
  getOptionsListApi({ countries: {} }).then((res: any) => {
    if (res.data.countries.length > 0) {
      countryList.value = res.data.countries
    }
  })
  getreadMsgApi({ isValid: '1', pageNum: 1, pageSize: 100 }).then((res: any) => {
    if (res.data.list.length > 0) {
      res.data.list.forEach((item: { code: string; content: string }) => {
        if (item.code === 'globalRestDays.create') {
          htmlContent.value = item.content
        }
      })
    }
  })
})
// 搜索
const form = ref({
  countryNumCode: '',
  restDay: [],
  pageNum: 1,
  pageSize: 30,
  orderBys: 'restDay:desc',
})
const onSearch = () => {
  getTableList()
}
const onReset = () => {
  form.value.pageNum = 1
  form.value.pageSize = 30
  form.value.countryNumCode = ''
  form.value.restDay = []
  getTableList()
}
const orderByField = ref('restDay')
const orderSortType = ref('descending')
const countryList = ref<{ label: string; value: string | number }[]>([])
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
const visibleDialog = ref(false)
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<BillItemSearchResultItem>>({
  restDay: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
})
const ruleForm = ref<BillItemSearchResultItem>({
  restDay: '',
  id: 0,
  countryNumCode: '',
  restDayType: '',
})
const edit = (row: BillItemSearchResultItem) => {
  visibleDialog.value = true
  nextTick(() => {
    for (let key in ruleForm.value) {
      if (row.hasOwnProperty(key)) {
        ruleForm.value[key] = row[key]
      }
    }
  })
}
const del = async (row: { id: number }) => {
  ElMessageBox.confirm('Are you sure you want to delete this data?', 'Warning', {
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    type: 'warning',
    customClass: 'del-message-box',
  })
    .then(async () => {
      await deleteHolidayApi({ id: row.id })
      ElMessage({
        type: 'success',
        message: `Success`,
      })
      getTableList()
    })
    .catch(() => {
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
      let params = {
        id: formCopy.id,
        restDay: formCopy.restDay,
        countryNumCode: formCopy.countryNumCode,
        restDayType: formCopy.restDayType,
      }
      editHolidayApi(params).then(() => {
        getTableList()
        closeDialog()
        ElMessage({
          type: 'success',
          message: `Success`,
        })
      })
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
}
const getTableList = () => {
  let params = JSON.parse(JSON.stringify(form.value))
  params.restDayStart = params.restDay && params.restDay.length > 0 ? params.restDay[0] : ''
  params.restDayEnd = params.restDay && params.restDay.length > 0 ? params.restDay[1] : ''
  delete params.restDay
  getHolidayPageApi(params).then((res) => {
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
        label-width="118px"
      >
        <el-form-item label="Country" prop="countryNumCode">
          <el-select v-model="form.countryNumCode" filterable placeholder="Please Select" clearable>
            <el-option
              v-for="item in countryList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Holiday Date" prop="countryNumCode">
          <el-date-picker
            v-model="form.restDay"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch" class="bg-[#2D8AE0]">Search</el-button>
          <el-button @click="onReset">Reset</el-button>
        </el-form-item>
      </el-form>
      <el-table
        :data="tableData"
        style="width: 100%"
        :default-sort="{ prop: orderByField, order: orderSortType }"
        @sort-change="handleSortChange"
        height="calc(100vh - 240px)"
        stripe
      >
        <el-table-column prop="id" label="#" width="60">
          <template #default="{ $index }">
            <div>{{ indexMethod($index) }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="countryNameEn"
          label="Country"
          min-width="118"
          show-overflow-tooltip
        />
        <el-table-column
          prop="restDay"
          label="Holiday Date"
          min-width="118"
          sortable
          show-overflow-tooltip
        />
        <el-table-column
          prop="restDayTypeName"
          label="Holiday Type"
          min-width="102"
          show-overflow-tooltip
        />
        <el-table-column label="" min-width="60">
          <template #default="{ row }">
            <div class="flex items-center">
              <div class="w-[16px] h-[16px] mr-[24px] cursor-pointer" @click="edit(row)">
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
              <div class="w-[16px] h-[16px] cursor-pointer" @click="del(row)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2.5 4.00002H1.5C1.36739 4.00002 1.24021 3.94735 1.14645 3.85358C1.05268 3.75981 1 3.63263 1 3.50002C1 3.36742 1.05268 3.24024 1.14645 3.14647C1.24021 3.0527 1.36739 3.00002 1.5 3.00002H5.5V1.49902C5.5 1.36642 5.55268 1.23924 5.64645 1.14547C5.74021 1.0517 5.86739 0.999023 6 0.999023H10C10.1326 0.999023 10.2598 1.0517 10.3536 1.14547C10.4473 1.23924 10.5 1.36642 10.5 1.49902V3.00002H14.5C14.6326 3.00002 14.7598 3.0527 14.8536 3.14647C14.9473 3.24024 15 3.36742 15 3.50002C15 3.63263 14.9473 3.75981 14.8536 3.85358C14.7598 3.94735 14.6326 4.00002 14.5 4.00002H13.5V14.5C13.5 14.6326 13.4473 14.7598 13.3536 14.8536C13.2598 14.9473 13.1326 15 13 15H3C2.86739 15 2.74021 14.9473 2.64645 14.8536C2.55268 14.7598 2.5 14.6326 2.5 14.5V4.00002ZM9.5 3.00002V2.00002H6.5V3.00002H9.5ZM3.5 14H12.5V4.00002H3.5V14ZM6.5 12C6.36739 12 6.24021 11.9473 6.14645 11.8536C6.05268 11.7598 6 11.6326 6 11.5V6.50002C6 6.36742 6.05268 6.24024 6.14645 6.14647C6.24021 6.0527 6.36739 6.00002 6.5 6.00002C6.63261 6.00002 6.75979 6.0527 6.85355 6.14647C6.94732 6.24024 7 6.36742 7 6.50002V11.5C7 11.6326 6.94732 11.7598 6.85355 11.8536C6.75979 11.9473 6.63261 12 6.5 12ZM9.5 12C9.36739 12 9.24021 11.9473 9.14645 11.8536C9.05268 11.7598 9 11.6326 9 11.5V6.50002C9 6.36742 9.05268 6.24024 9.14645 6.14647C9.24021 6.0527 9.36739 6.00002 9.5 6.00002C9.63261 6.00002 9.75979 6.0527 9.85355 6.14647C9.94732 6.24024 10 6.36742 10 6.50002V11.5C10 11.6326 9.94732 11.7598 9.85355 11.8536C9.75979 11.9473 9.63261 12 9.5 12Z"
                    fill="#2D8AE0"
                  />
                </svg>
              </div>
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
          <div :id="titleId" :class="titleClass">Edit Holiday Date</div>
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
          :model="ruleForm"
          :rules="rules"
          label-width="auto"
          class="demo-ruleForm"
        >
          <el-form-item label="Holiday Date" prop="restDay">
            <el-date-picker
              v-model="ruleForm.restDay"
              type="date"
              placeholder="Pick a Date"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
            />
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
