<script setup>
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import SvgIcon from '@/components/SvgIcon.vue'
import { useUserStore, useIconStore } from '@/stores'
const router = useRouter()
const currentRoute = computed(() => router.currentRoute.value)
const isCollapse = ref(false)

// 添加默认展开的子菜单数组
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 导航到指定路径
const navigateTo = (path) => {
  router.push(path)
}

// 获取菜单项样式
const getMenuItemStyle = (path) => ({
  backgroundColor: currentRoute.value.path === path ? '#fff' : '',
  color: currentRoute.value.path === path ? '#2d8ae0 !important' : '#fff',
})
const getSvgFillColor = (path) => {
  return currentRoute.value.path === path ? '#2d8ae0' : '#fff'
}

// 获取标题样式
const getTitleStyle = (path) => ({
  color: currentRoute.value.path === path ? '#2d8ae0' : '#fff',
  backgroundColor: currentRoute.value.path === path ? '#fff' : '',
})
const menuItems1 = ref([
  {
    index: '1-0',
    route: '/Aircompany',
    icon: 'AircompanyIcon',
    title: 'AirCompany',
  },
  {
    index: '1-13',
    route: '/Railcompany',
    icon: 'RailcompanyIcon',
    title: 'RailCompany',
  },
  {
    index: '1-14',
    route: '/Truckcompany',
    icon: 'TruckcompanyIcon',
    title: 'TruckCompany',
  },
  {
    index: '1-15',
    route: '/Warehouse',
    icon: 'WarehouseIcon',
    title: 'Warehouse',
  },
  {
    index: '1-16',
    route: '/LclWarehouseFreeTime',
    icon: 'TerminalIcon',
    title: 'LCL Warehouse Free Time',
  },
  {
    index: '1-17',
    route: '/FclOutsideFreeTime',
    icon: 'BasePortTTIcon',
    title: 'FCL Outside Free Time',
  },
  {
    index: '1-18',
    route: '/FclDndRate',
    icon: 'FclOverweightRuleIcon',
    title: 'FCL DND Rate',
  },
  {
    index: '1-19',
    route: '/FclOriginCharge',
    icon: 'FclOriginChargeIcon',
    title: 'FCL Origin Charge',
  },
  {
    index: '1-20',
    route: '/FclOverweightRule',
    icon: 'FclOverweightRuleIcon',
    title: 'FCL Overweight Rule',
  },
  {
    index: '1-1',
    route: '/CarrierManagement',
    icon: 'CarrierManagementIcon',
    title: 'Carrier',
  },
  {
    index: '1-2',
    route: '/SupplierManagement',
    icon: 'SupplierManagementIcon',
    title: 'Supplier Management',
  },
  {
    index: '1-3',
    route: '/Port',
    icon: 'PortIcon',
    title: 'Port',
  },
  {
    index: '1-4',
    route: '/PortAttributes',
    icon: 'PortAttributesIcon',
    title: 'Port Attributes',
  },
  {
    index: '1-5',
    route: '/PortMapping',
    icon: 'PortMappingIcon',
    title: 'Port Mapping',
  },
  {
    index: '1-6',
    route: '/Terminal',
    icon: 'TerminalIcon',
    title: 'Terminal',
  },
  {
    index: '1-7',
    route: '/TerminalMapping',
    icon: 'TerminalMappingIcon',
    title: 'Terminal Mapping',
  },
  {
    index: '1-8',
    route: '/SVManagement',
    icon: 'SVManagementIcon',
    title: 'SV Management',
  },
  {
    index: '1-9',
    route: '/SVMapping',
    icon: 'SVMappingIcon',
    title: 'SV Mapping',
  },
  {
    index: '1-10',
    route: '/BasePortTT',
    icon: 'BasePortTTIcon',
    title: 'Base Port TT',
  },
  {
    index: '1-11',
    route: '/TransshipmentPortTT',
    icon: 'TransshipmentPortTTIcon',
    title: 'Transshipment Port TT',
  },
  {
    index: '1-12',
    route: '/Holidays',
    icon: 'HolidaysIcon',
    title: 'Holidays',
  },
])
const menuItems2 = ref([
  {
    index: '2-1',
    route: '/SourceManagement',
    icon: 'SourceManagementIcon',
    title: 'Source Management',
  },
  {
    index: '2-2',
    route: '/Country',
    icon: 'CountryIcon',
    title: 'Country',
  },
  {
    index: '2-3',
    route: '/ProviceState',
    icon: 'ProviceStateIcon',
    title: 'Provice/State',
  },
  {
    index: '2-4',
    route: '/City',
    icon: 'CityIcon',
    title: 'City',
  },
])
const defaultopenedsList = ref(['1'])
const handleOpen = (key, keyPath) => {
  defaultopenedsList.value.push(key)
}
const handleClose = (key, keyPath) => {
  defaultopenedsList.value.forEach((item) => {
    item === key ? defaultopenedsList.value.splice(defaultopenedsList.value.indexOf(key), 1) : ''
  })
}
</script>

<template>
  <div>
    <div class="h-[60px] bg-[#2d8ae0] p-[8px]">
      <div class="flex items-center justify-between pt-[16px] pl-[10px] pb-[16px] pr-[7px]">
        <transition
          ><img
            src="@/assets/sidebar/logo.png"
            class="w-[92px] h-[24px]"
            alt=""
            v-show="!isCollapse"
        /></transition>
      </div>
    </div>
    <div>
      <el-menu
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        @open="handleOpen"
        @close="handleClose"
        :default-openeds="defaultopenedsList"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon>
              <span v-html="useIconStore().TitleIcon" class="mr-[8px] w-[16px] h-[16px]"></span>
            </el-icon>
            <span class="text-[#fff]">Sea Data</span>
          </template>
          <el-menu-item-group class="mt-[8px]">
            <el-menu-item
              v-for="item in menuItems1"
              :key="item.index"
              :index="item.index"
              @click="navigateTo(item.route)"
            >
              <template #title>
                <span :style="getTitleStyle(item.route)" class="w-full flex items-center pl-[40px]">
                  <svg-icon :svg="useIconStore()[item.icon]" class="mr-[8px]" />
                  {{ item.title }}
                </span>
              </template>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <el-icon>
              <span v-html="useIconStore().TitleTwoIcon" class="mr-[8px] w-[16px] h-[16px]"></span>
            </el-icon>
            <span class="text-[#fff]">Geographical Location</span>
          </template>
          <el-menu-item-group class="mt-[8px]">
            <el-menu-item
              v-for="item in menuItems2"
              :key="item.index"
              :index="item.index"
              @click="navigateTo(item.route)"
            >
              <template #title>
                <span :style="getTitleStyle(item.route)" class="w-full flex items-center pl-[40px]">
                  <svg-icon :svg="useIconStore()[item.icon]" class="mr-[8px]" />
                  {{ item.title }}
                </span>
              </template>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
      </el-menu>

      <!-- <div class="showMenu" v-if="isCollapse">
        <el-icon style="font-size: 18px; margin-left: 16px; margin-top: 20px"><location /></el-icon>
      </div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-menu) {
  border-right: none;
  background-color: var(--background-default11);
}

:deep(.el-menu-item) {
  line-height: 38px;
  height: 38px;
  margin-bottom: 8px;
  padding: 0px !important;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 272px;
  height: calc(100vh - 60px);
  background-color: var(--background-default11);
}
.showMenu {
  width: 54px;
  height: calc(100vh - 60px);
  background-color: var(--background-default11);
}
.el-menu--collapse {
  height: 100vh;
  background-color: var(--background-default11);
}
:deep(.el-menu-item:hover) {
  span {
    color: #2d8ae0 !important;
  }

  background-color: #eaf3fc;
}
:deep(.el-sub-menu__title) {
  line-height: 38px;
  height: 38px;
}
:deep(.el-sub-menu__title:hover) {
  background-color: var(--background-default11);
}

:deep(.el-sub-menu .el-sub-menu__icon-arrow) {
  color: #fff;
  font-size: 16px;
}
:deep(.el-menu-item-group__title) {
  padding: 0;
}
:deep(.el-menu-item.is-active) {
  background-color: #fff;
}
</style>
