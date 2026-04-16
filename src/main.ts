// 捕获全局资源加载错误
window.addEventListener('error', (event) => {
  if (event.target instanceof HTMLScriptElement || event.target instanceof HTMLLinkElement) {
    const target = event.target;
    if (target.tagName === 'SCRIPT' || target.tagName === 'LINK') {
      const websitelastReloadTime: any = localStorage.getItem('websitelastReloadTime');
      const currentTime: any = new Date().getTime();
      const sixHours = 6 * 60 * 60 * 1000; // 6 小时的毫秒数
      if (!websitelastReloadTime || (currentTime - websitelastReloadTime) > sixHours) {
        localStorage.setItem('websitelastReloadTime', currentTime);
        window.location.reload();
      }
    }
  }
}, true);

// 捕获全局未处理的 Promise 拒绝（包括动态模块加载错误）
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message?.includes('Failed to fetch dynamically imported module')) {
    const websitelastReloadTime: any = localStorage.getItem('websitelastReloadTime');
    const currentTime: any = new Date().getTime();
    const sixHours = 6 * 60 * 60 * 1000; // 6 小时的毫秒数
    if (!websitelastReloadTime || (currentTime - websitelastReloadTime) > sixHours) {
      localStorage.setItem('websitelastReloadTime', currentTime);
      window.location.reload();
    }
  }
});


import './style/main.scss'
import './style/element.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'
import pinia from './stores'
// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:windi.css'
// import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 国际化
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus)
app.use(ElementPlus, {
  locale: en,
})
app.use(pinia)
app.use(createPinia().use(persist))
app.use(router)
app.mount('#app')
