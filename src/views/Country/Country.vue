<script setup lang="ts">
import { onMounted, ref, reactive, nextTick } from 'vue'
import { getCountryPageApi, addCountryApi, editCountryApi, patchCountryApi } from '@/api/Country'
import { getreadMsgApi } from '@/api/Public'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import type { BillItemSearchResultItem } from '@/types/Country'
onMounted(() => {
  getTableList()
  getreadMsgApi({ isValid: '1', pageNum: 1, pageSize: 100 }).then((res: any) => {
    if (res.data.list.length > 0) {
      res.data.list.forEach((item: { code: string; content: string }) => {
        if (item.code === 'dictCountries.create') {
          htmlContent.value = item.content
        }
      })
    }
  })
})
// 搜索
const form = ref({
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
const getTableList = () => {
  getCountryPageApi(form.value).then((res) => {
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
  titleDialog.value = 'New Country'
  visibleDialog.value = true
}
const edit = (row: BillItemSearchResultItem) => {
  titleDialog.value = 'Edit Country'
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
const codeFlag = ref(true)
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<BillItemSearchResultItem>>({
  code: [
    {
      required: true,
      validator: (_rule, value, callback) => {
        const pattern = /^[A-Z]{2}$/
        if (!value || (value && !pattern.test(value))) {
          callback(new Error('Enter only two capital letters'))
          codeFlag.value = false
        } else {
          callback()
          codeFlag.value = false
        }
      },
      trigger: 'change',
    },
  ],
  numCode: [
    {
      required: true,
      validator: (_rule, value, callback) => {
        const pattern = /^\d{1,3}$/ // 修改正则表达式
        if (!value || (value && !pattern.test(value))) {
          callback(new Error('Enter up to three digits')) // 修改错误提示
        } else {
          callback()
        }
      },
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
  code: '',
  id: 0,
  nameCn: '',
  nameEn: '',
  numCode: '',
  flagUrl: '',
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
      await patchCountryApi({ id: row.id, isValid: row.isValid })
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
      if (titleDialog.value === 'New Country') {
        delete formCopy.id
        addCountryApi(formCopy).then((res) => {
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
        editCountryApi(formCopy).then(() => {
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
  codeFlag.value = true
  nextTick(() => {
    ruleFormRef.value?.resetFields() // 清空字段并重置校验状态
  })
}
const htmlContent = ref(``)
</script>

<template>
  <div class="mt-[3px]">
    <div class="p-[24px] bg-white">
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
        New Country</el-button
      >
      <el-table
        :data="tableData"
        style="width: 100%"
        :default-sort="{ prop: orderByField, order: orderSortType }"
        @sort-change="handleSortChange"
        height="calc(100vh - 240px)"
        stripe
      >
        <el-table-column prop="id" label="#" width="64">
          <template #default="{ $index }">
            <div>{{ indexMethod($index) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="LDC_PK" width="88" show-overflow-tooltip />
        <el-table-column prop="code" label="Country Code" min-width="118" show-overflow-tooltip />
        <el-table-column
          prop="numCode"
          label="Country Numeric Code"
          min-width="186"
          show-overflow-tooltip
        />
        <el-table-column prop="nameEn" label="English Name" min-width="136" show-overflow-tooltip />
        <el-table-column prop="nameCn" label="Chinese Name" min-width="136" show-overflow-tooltip />
        <el-table-column prop="flagUrl" label="Flag Image URL" width="136"
          ><template #default="{ row }">
            <div class="w-[23px] h-[23px]">
              <img :src="row.flagUrl" alt="" />
            </div>
          </template>
        </el-table-column>
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
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="Country Code" prop="code">
                <el-input placeholder="Input" v-model.trim="ruleForm.code" />
                <div
                  v-if="codeFlag"
                  class="leading-none text-[12px] text-[#2D8AE0] mt-[2px] mb-[-18px] fade-in-delay"
                >
                  Enter only two capital letters
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Country Numeric Code" prop="numCode">
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
          <el-form-item label="Flag Image URL" prop="flagUrl">
            <el-input placeholder="Input" v-model.trim="ruleForm.flagUrl" />
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

<style lang="scss" scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in-delay {
  animation: fade-in 0.3s ease forwards;
  animation-delay: 0.5s;
  opacity: 0;
}
</style>
