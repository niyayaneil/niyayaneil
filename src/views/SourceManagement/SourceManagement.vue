<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getSourceManagementPageApi } from '@/api/SourceManagement'
import type { BillItemSearchResultItem } from '@/types/SourceManagement'
onMounted(() => {
  getTableList()
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
  getSourceManagementPageApi(form.value).then((res) => {
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
  form.value.pageNum = val
  getTableList()
}
const handlePageSizeChange = (val: number) => {
  form.value.pageSize = val
  form.value.pageNum = 1
  getTableList()
}
const tableData = ref<BillItemSearchResultItem[]>([])
</script>

<template>
  <div class="mt-[6px] w-[1060px]">
    <div class="w-full p-[24px] bg-white">
      <el-table
        :data="tableData"
        style="width: 100%"
        :default-sort="{ prop: orderByField, order: orderSortType }"
        @sort-change="handleSortChange"
        stripe
      >
        <el-table-column label="#" width="64">
          <template #default="{ $index }">
            <div>{{ indexMethod($index) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="Source Code" min-width="267" />
        <el-table-column prop="name" label="Source Name" min-width="267" />
        <el-table-column prop="systemUpdateUser" label="Updater" min-width="136" />
        <el-table-column prop="systemUpdateTimeUtc" label="Update time" sortable width="166">
          <template #default="{ row }">
            <div>{{ row.systemUpdateTimeUtc.replace(/:\d{2}$/, '') }}</div>
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
  </div>
</template>

<style lang="scss" scoped></style>
