import { createRouter, createWebHashHistory } from 'vue-router'
import { defaultUserData } from './localStorage';
import { useUserStore } from '@/stores'
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [{
    path: '/',
    // redirect: localStorage.getItem('userData') ? '/BillManagement' : '/login-center',
    redirect: '/CarrierManagement',
    component: () => import('@/views/Layout/LayoutIndex.vue'),
    children: [
      // Sea Data
      {
        path: 'CarrierManagement',
        component: () => import('@/views/CarrierManagement/CarrierManagement.vue'),
        meta: { parTitle: 'Sea Data', title: 'Carrier' }
      },
      {        path: 'Aircompany',        component: () => import('@/views/Aircompany/Aircompany.vue'),        meta: { parTitle: 'Sea Data', title: 'AirCompany' }      },
      {        path: 'Railcompany',        component: () => import('@/views/Railcompany/Railcompany.vue'),        meta: { parTitle: 'Sea Data', title: 'RailCompany' }      },
      {        path: 'Truckcompany',        component: () => import('@/views/Truckcompany/Truckcompany.vue'),        meta: { parTitle: 'Sea Data', title: 'TruckCompany' }      },
      {
        path: 'SupplierManagement',
        component: () => import('@/views/SupplierManagement/SupplierManagement.vue'),
        meta: { parTitle: 'Sea Data', title: 'Supplier Management' }
      },
      {
        path: 'Port',
        component: () => import('@/views/Port/Port.vue'),
        meta: { parTitle: 'Sea Data', title: 'Port' }
      },
      {
        path: 'PortAttributes',
        component: () => import('@/views/PortAttributes/PortAttributes.vue'),
        meta: { parTitle: 'Sea Data', title: 'Port Attributes' }
      },
      {
        path: 'PortMapping',
        component: () => import('@/views/PortMapping/PortMapping.vue'),
        meta: { parTitle: 'Sea Data', title: 'Port Mapping' }
      },
      {
        path: 'Terminal',
        component: () => import('@/views/Terminal/Terminal.vue'),
        meta: { parTitle: 'Sea Data', title: 'Terminal' }
      },
      {
        path: 'TerminalMapping',
        component: () => import('@/views/TerminalMapping/TerminalMapping.vue'),
        meta: { parTitle: 'Sea Data', title: 'Terminal Mapping' }
      },
      {
        path: 'SVManagement',
        component: () => import('@/views/SVManagement/SVManagement.vue'),
        meta: { parTitle: 'Sea Data', title: 'SV Management' }
      },
      {
        path: 'SVMapping',
        component: () => import('@/views/SVMapping/SVMapping.vue'),
        meta: { parTitle: 'Sea Data', title: 'SV Mapping' }
      },
      {
        path: 'BasePortTT',
        component: () => import('@/views/BasePortTT/BasePortTT.vue'),
        meta: { parTitle: 'Sea Data', title: 'Base Port TT' }
      },
      {
        path: 'TransshipmentPortTT',
        component: () => import('@/views/TransshipmentPortTT/TransshipmentPortTT.vue'),
        meta: { parTitle: 'Sea Data', title: 'Transshipment Port TT' }
      },
      {
        path: 'Holidays',
        component: () => import('@/views/Holidays/Holidays.vue'),
        meta: { parTitle: 'Sea Data', title: 'Holidays' }
      },
      // Geographical Location
      {
        path: 'SourceManagement',
        component: () => import('@/views/SourceManagement/SourceManagement.vue'),
        meta: { parTitle: 'Geographical Location', title: 'Source Management' }
      },
      {
        path: 'Country',
        component: () => import('@/views/Country/Country.vue'),
        meta: { parTitle: 'Geographical Location', title: 'Country' }
      },
      {
        path: 'ProviceState',
        component: () => import('@/views/ProviceState/ProviceState.vue'),
        meta: { parTitle: 'Geographical Location', title: 'Provice/State' }
      },
      {
        path: 'City',
        component: () => import('@/views/City/City.vue'),
        meta: { parTitle: 'Geographical Location', title: 'City' }
      }
    ]
  }
  ]
})
// 访问权限控制
router.beforeEach(async (to) => {
  const clientID = import.meta.env.VITE_CLIENT_ID
  const newArr = JSON.parse(localStorage.getItem('userData') as any)
  if (import.meta.env.MODE === 'base') {
    localStorage.setItem('tokenStartTime', '9747631289462')
    const dataToStore = JSON.stringify(defaultUserData);
    localStorage.setItem('userData', dataToStore);
  }
  if (newArr && newArr[clientID]) {
    const newObj = newArr[clientID]
    if (newObj.userServers) {
      const selfPro = newObj.userServers.split(',')

      if (selfPro.indexOf(clientID) !== -1) {
        const { setUser, setToken, setClientName } = useUserStore()
        // 储存用户信息
        setUser(newObj)
        // 储存用户名
        setClientName(newObj.preferred_username)
        // 储存token
        setToken(newObj.token)

      } else {
        alert('此用户没有登陆该项目的权限')
        window.location.href = '/login-center'
      }
    } else {
      window.location.href = '/login-center'
    }
  } else {
    window.location.href = '/login-center'
  }

  const tokenStartTime = window.localStorage.getItem('lastReloadintraTime') as any
  const timeOver = 23 * 3600 * 1000
  const date = new Date().getTime()
  if (!tokenStartTime) {
    localStorage.setItem('lastReloadintraTime', Date.now().toString())
    return
  }
  if (date - tokenStartTime > timeOver) {
    window.localStorage.clear()
    window.location.href = '/login-center'
  }

})
router.afterEach((to) => {
  // 修改标题
  document.title = `Dict-${to.meta.title || ''}`
})
export default router

