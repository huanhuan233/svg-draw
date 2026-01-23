<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1 class="header-title">SVG Draw</h1>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
// 主应用组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #1d121b;
  background-color: #f7f8fa;
}

.app-container {
  min-height: 100vh;
}

.app-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: 64px !important;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 24px;
}

.header-title {
  font-size: 16px;
  font-weight: 400;
  color: #1d121b;
}

.app-main {
  padding: 0;
  background-color: #f7f8fa;
}
</style>
