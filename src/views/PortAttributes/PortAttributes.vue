<script setup lang="ts">
import { onMounted, ref, h, reactive, nextTick } from 'vue'
import {
  getPortAttributesPageApi,
  addPortAttributesApi,
  batchImportPortAttributesApi,
  editPortAttributesApi,
  patchPortAttributesApi,
} from '@/api/PortAttributes'
import { getOptionsListApi, getreadMsgApi } from '@/api/Public'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import type { BillItemSearchResultItem } from '@/types/PortAttributes'
onMounted(() => {
  onSearch()
  // 找到所有港口
  getOptionsListApi({ globalPorts: {} }).then((res: any) => {
    if (res.data.globalPorts.length > 0) {
      globalPortList.value = res.data.globalPorts
    }
  })
  // 找到所有有效港口
  getOptionsListApi({ globalPorts: { isValid: '1' } }).then((res: any) => {
    if (res.data.globalPorts.length > 0) {
      globalPortListValid.value = res.data.globalPorts
    }
  })
  // 找到所有有效港口属性
  getOptionsListApi({ globalPortAttriTypes: { isValid: '1' } }).then((res: any) => {
    if (res.data.globalPortAttriTypes.length > 0) {
      globalPortAttrisValid.value = res.data.globalPortAttriTypes
    }
  })

  getreadMsgApi({ isValid: '1', pageNum: 1, pageSize: 100 }).then((res: any) => {
    if (res.data.list.length > 0) {
      res.data.list.forEach((item: { code: string; content: string }) => {
        if (item.code === 'globalPortAttriMappings.create') {
          htmlContent.value = item.content
        }
      })
    }
  })
})

const onSearch = () => {
  getTableList()
}
const onReset = () => {
  form.value.globalPortCode = ''
  form.value.pageNum = 1
  form.value.pageSize = 30
  form.value.orderBys = 'systemUpdateTimeUtc:desc'
  getOptionsListApi({ globalPorts: {} }).then((res: any) => {
    if (res.data.globalPorts.length > 0) {
      globalPortList.value = res.data.globalPorts
    }
  })
  getTableList()
}
const globalPortList = ref<{ label: string; value: string | number }[]>([])
const globalPortListValid = ref<{ label: string; value: string | number }[]>([])
const globalPortAttrisValid = ref<{ label: string; value: string | number }[]>([])
const globalPortAttrisValueValid = ref<{ label: string; value: string | number }[]>([])
// 搜索
const form = ref({
  globalPortCode: '',
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
  getPortAttributesPageApi(form.value).then((res) => {
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
  titleDialog.value = 'New Port Attribute'
  visibleDialog.value = true
}
const handleglobalPortAttrisChange = () => {
  if (ruleForm.value.globalPortAttriType) {
    getOptionsListApi({
      globalPortAttris: { isValid: '1', type: ruleForm.value.globalPortAttriType },
    }).then((res: any) => {
      if (res.data.globalPortAttris.length > 0) {
        globalPortAttrisValueValid.value = res.data.globalPortAttris
      }
    })
  } else {
    globalPortAttrisValueValid.value = []
  }
  ruleForm.value.globalPortAttriId = ''
}
const edit = (row: BillItemSearchResultItem) => {
  titleDialog.value = 'Edit Port Attribute'
  getOptionsListApi({ globalPortAttris: { isValid: '1', type: row.globalPortAttriType } }).then(
    (res: any) => {
      if (res.data.globalPortAttris.length > 0) {
        globalPortAttrisValueValid.value = res.data.globalPortAttris
      }
    },
  )
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
  globalPortCode: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  globalPortAttriType: [
    {
      required: true,
      message: 'Required',
      trigger: 'change',
    },
  ],
  globalPortAttriId: [
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
  globalPortCode: '',
  globalPortAttriType: '',
  globalPortAttriId: '',
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
      await patchPortAttributesApi({ id: row.id, isValid: row.isValid })
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
      if (titleDialog.value === 'New Port Attribute') {
        delete formCopy.id
        addPortAttributesApi(formCopy).then((res) => {
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
        editPortAttributesApi(formCopy).then(() => {
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
  globalPortAttrisValueValid.value = []
  nextTick(() => {
    ruleFormRef.value?.resetFields() // 清空字段并重置校验状态
  })
}
// 导入
const importVisibleDialog = ref(false)
const dataIsValidFlag = ref(false)
const originsList = ref([])
const recordsList = ref([])
const importExcel = () => {
  importVisibleDialog.value = true
}

const uploadAction =
  import.meta.env.VITE_BASE_URL +
  import.meta.env.VITE_API_URL +
  '/mgr/globalPortAttriMappings/import/preview'
const downloadTemplate = () => {
  const url = import.meta.env.VITE_FILE_URL + 'dict-service/en_port_attri_template.xlsx'
  const a = document.createElement('a')
  a.href = url
  a.download = 'PortAttributesTemplate.xlsx'
  document.body.appendChild(a)
  a.setAttribute('target', '_blank')
  a.click()
  document.body.removeChild(a)
}
const beforeAvatarUpload = (file) => {
  const isLt1M = file.size / 1024 / 1024 < 1
  if (!isLt1M) {
    ElMessage({
      type: 'warning',
      message: `xls/.xlsx files can be saved in a maximum of 1 MB`,
    })
  }
  return isLt1M
}
const fileUploadSuccess = (res) => {
  const { code, dataIsValid, origins, records } = res
  if (code === 200) {
    originsList.value = origins
    recordsList.value = records
    dataIsValidFlag.value = dataIsValid
  } else {
    ElMessage({
      type: 'warning',
    })
  }
}
const columns = [
  {
    key: 'index',
    title: '#',
    dataKey: 'index',
    width: 50,
    cellRenderer: ({ rowIndex }) => {
      return rowIndex + 1
    },
  },
  {
    key: 'globalPortName',
    title: 'Port',
    dataKey: 'globalPortName',
    width: 424,
    cellRenderer: ({ rowData }) => {
      return h(
        'div',
        {
          class:
            rowData.error === null
              ? ''
              : rowData.error.errorFields.includes('globalPortName')
                ? rowData.error.errorType === 'empty' || rowData.error.errorType === 'duplicate'
                  ? 'Hy'
                  : 'Hr'
                : '',
          title: rowData.globalPortName,
          style: {
            textAlign: 'left',
            width: '424px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
        rowData.globalPortName,
      )
    },
  },
  {
    key: 'globalPortAttriTypeName',
    title: 'Attribute Type',
    dataKey: 'globalPortAttriTypeName',
    width: 226,
    cellRenderer: ({ rowData }) => {
      return h(
        'div',
        {
          class:
            rowData.error === null
              ? ''
              : rowData.error.errorFields.includes('globalPortAttriTypeName')
                ? rowData.error.errorType === 'empty' || rowData.error.errorType === 'duplicate'
                  ? 'Hy'
                  : 'Hr'
                : '',
          title: rowData.globalPortAttriTypeName,
          style: {
            textAlign: 'left',
            width: '226px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
        rowData.globalPortAttriTypeName,
      )
    },
  },
  {
    key: 'globalPortAttriName',
    title: 'Attribute Value',
    dataKey: 'globalPortAttriName',
    width: 226,
    cellRenderer: ({ rowData }) => {
      return h(
        'div',
        {
          class:
            rowData.error === null
              ? ''
              : rowData.error.errorFields.includes('globalPortAttriName')
                ? rowData.error.errorType === 'empty' || rowData.error.errorType === 'duplicate'
                  ? 'Hy'
                  : 'Hr'
                : '',
          title: rowData.globalPortAttriName,
          style: {
            textAlign: 'left',
            width: '226px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
        rowData.globalPortAttriName,
      )
    },
  },
]
const uploadRef = ref()
const submitImport = async () => {
  if (originsList.value.length === 0) {
    uploadRef.value!.submit()
  } else {
    let res = await batchImportPortAttributesApi(originsList.value)
    if (res.code === 200) {
      getTableList()
      closeDownDialog()
      ElMessage({
        type: 'success',
        message: `Success`,
      })
    }
  }
}
const closeDownDialog = () => {
  importVisibleDialog.value = false
  dataIsValidFlag.value = false
  originsList.value = []
  recordsList.value = []
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
        <el-form-item label="Port" prop="globalPortCode">
          <el-select v-model="form.globalPortCode" filterable placeholder="Please Select" clearable>
            <el-option
              v-for="item in globalPortList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
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
          New Port Attributes</el-button
        >
        <el-button
          @click="importExcel"
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
          Import Port Attributes</el-button
        >
      </div>
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
        <el-table-column
          prop="globalPortNameEn"
          label="Port"
          min-width="136"
          show-overflow-tooltip
        />
        <el-table-column
          prop="globalPortAttriType"
          label="Attribute Type"
          min-width="118"
          show-overflow-tooltip
        />
        <el-table-column
          prop="globalPortAttriName"
          label="Attribute Value"
          min-width="136"
          show-overflow-tooltip
        />
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
          <el-form-item label="Port" prop="globalPortCode">
            <el-select
              v-model.trim="ruleForm.globalPortCode"
              filterable
              placeholder="Please Select"
              clearable
            >
              <el-option
                v-for="item in globalPortListValid"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="Attribute Type" prop="globalPortAttriType" class="w-[282px]">
            <el-select
              v-model="ruleForm.globalPortAttriType"
              filterable
              placeholder="Please Select"
              @change="handleglobalPortAttrisChange"
              clearable
            >
              <el-option
                v-for="item in globalPortAttrisValid"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Attribute Value" prop="globalPortAttriId">
                <el-select
                  v-model="ruleForm.globalPortAttriId"
                  filterable
                  placeholder="Please Select"
                  clearable
                >
                  <el-option
                    v-for="item in globalPortAttrisValueValid"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select> </el-form-item
            ></el-col>
            <el-col :span="12">
              <el-form-item label="Status" prop="isValid">
                <el-radio-group v-model="ruleForm.isValid">
                  <el-radio value="0" border>Invalid</el-radio>
                  <el-radio value="1" border>Valid</el-radio>
                </el-radio-group>
              </el-form-item></el-col
            >
          </el-row>
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
    <!-- 导入 -->
    <el-dialog
      v-model="importVisibleDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="1024"
    >
      <template #header="{ titleId, titleClass }">
        <div class="flex justify-between">
          <div :id="titleId" :class="titleClass">Import Port Attributes</div>
          <div class="flex items-center">
            <el-tooltip placement="bottom-end" effect="light" popper-class="mark">
              <template #content>
                <div v-html="htmlContent"></div>
              </template>
              <div class="w-[16px] h-[16px] cursor-pointer mr-[24px]" v-if="htmlContent">
                <img src="@/assets/images/mark.jpg" class="w-full h-full" />
              </div>
            </el-tooltip>

            <div class="w-[16px] h-[16px] cursor-pointer" @click="closeDownDialog">
              <img src="@/assets/images/close.jpg" class="w-full h-full" />
            </div>
          </div>
        </div>
      </template>
      <div v-if="originsList.length === 0">
        <div class="flex items-center mb-[8px]">
          <div class="w-[8px] h-[8px] mr-[8px] bg-[#FF7D00] rounded-full"></div>
          <div class="text-[#405262]">
            Highlighted yellow: Port has the same configured attributes
          </div>
        </div>
        <div class="flex items-center mb-[8px]">
          <div class="w-[8px] h-[8px] mr-[8px] bg-[#F53F3F] rounded-full"></div>
          <div class="text-[#405262]">
            Highlighted red: Dictionary not maintained, please maintain dictionary data first
          </div>
        </div>
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          accept=".xlsx, .xls"
          :auto-upload="false"
          :limit="1"
          :before-upload="beforeAvatarUpload"
          :data="form"
          :action="uploadAction"
          :on-success="fileUploadSuccess"
        >
          <div class="mb-[8px] flex justify-center">
            <img src="@/assets/images/upicon.png" class="w-[22px] h-[22px]" />
          </div>
          <div class="el-upload__text">
            <span class="text-[#333]">Drag the file here, or </span
            ><span class="text-[#36c]">click Add</span>
          </div>
          <div class="el-upload__tip text-[#999]">
            xls/.xlsx files can be saved in a maximum of 1 MB
          </div>
          <template #tip>
            <div class="flex items-center cursor-pointer mt-[8px]" @click="downloadTemplate">
              <div class="text-[#36c]">Download Template</div>
              <div class="w-[16px] h-[16px] ml-[8px]">
                <img src="@/assets/images/download.png" class="w-full h-full" />
              </div>
            </div>
          </template>
        </el-upload>
      </div>
      <div v-else>
        <div class="flex items-center mb-[8px]">
          <div class="w-[8px] h-[8px] mr-[8px] bg-[#FF7D00] rounded-full"></div>
          <div class="text-[#405262]">
            Highlighted yellow: Port has the same configured attributes
          </div>
        </div>
        <div class="flex items-center mb-[8px]">
          <div class="w-[8px] h-[8px] mr-[8px] bg-[#F53F3F] rounded-full"></div>
          <div class="text-[#405262]">
            Highlighted red: Dictionary not maintained, please maintain dictionary data first
          </div>
        </div>
        <el-table-v2 :columns="columns" :data="recordsList" :width="926" :height="360">
        </el-table-v2>
      </div>
      <template #footer>
        <div class="w-full text-right">
          <el-button
            type="primary"
            class="conBtn"
            :disabled="originsList.length !== 0 && !dataIsValidFlag"
            @click="submitImport"
          >
            Confirm
          </el-button>
          <el-button class="closeBtn" @click="closeDownDialog">Close</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table-v2__row-cell) {
  padding: 0px;
  line-height: 48px;
  height: 48px;
}
:deep(.el-table-v2__row-cell div) {
  padding-left: 12px;
}
:deep(.Hy) {
  background-color: #faecd8;
}
:deep(.Hr) {
  background-color: #ffe7e7;
}
</style>
