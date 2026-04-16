<script setup>
import sideBar from './compoments/side-bar.vue'
import navBar from './compoments/nav-bar.vue'
</script>

<template>
  <el-container class="app-layout">
    <side-bar></side-bar>
    <el-container class="right-layout">
      <el-header>
        <nav-bar></nav-bar>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
      <!-- <el-foot/> -->
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  .el-aside {
    overflow: auto;
    height: 100vh;
    width: 188px;
    background-color: #f1f1f1;
  }
  .right-layout {
    flex: 1;
    height: 100vh;
    overflow-y: auto;
    .el-main {
      --el-main-padding: 0;
      // padding: 10px;
      background-color: #f5f5f5;
    }
  }
  .el-header {
    background-color: #fff;
    border-bottom: 1px solid #ccc;
    padding: 0px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .anticon {
      font-size: 20px;
      cursor: pointer;
    }
  }
}

.my-avatar {
  color: #f56a00;
  background-color: #fde3cf;
  cursor: pointer;
}
</style>
