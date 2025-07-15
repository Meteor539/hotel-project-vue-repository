<template>
    <el-menu
        active-text-color="#ffd04b"
        background-color="#112f50"
        class="el-menu-vertical-demo"
        :default-active="$route.path"
        router="true"
        text-color="#fff"
        :collapse="props.isCollapse"
        @open="handleOpen"
        @close="handleClose"
      >
        <el-menu-item>
          <span>酒店管理系统后台 v1.0</span>
        </el-menu-item>
        <el-sub-menu index="1">
          <template #title>
            <el-icon><Shop /></el-icon>
            <span>分店管理</span>
          </template>
          <el-menu-item index="/branch/list">分店列表</el-menu-item>
          <el-menu-item index="/branch/add" style="display: none;">新增分店</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><House /></el-icon>
            <span>房间管理</span>
          </template>
          <el-menu-item index="/room/list">房间列表</el-menu-item>
          <el-menu-item index="/room/add" style="display: none;">新增房间</el-menu-item>
          <el-menu-item index="/room/status">房间状态</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <el-icon><Avatar /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/user/list">用户列表</el-menu-item>
          <el-menu-item index="/user/admin">管理员</el-menu-item>
        </el-sub-menu>
      </el-menu>
</template>

<script setup>

import {
  Shop,
  House,
  Avatar,
} from '@element-plus/icons-vue'

const props = defineProps(['isCollapse'])

const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}

const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}


</script>

<style scoped>
   
   .el-menu .is-active{
       background-color: #1e78bf !important;
       color:#fff !important;
   }

   .el-menu-vertical-demo:not(.el-menu--collapse) {
     width: 200px;
     min-height: 400px;
   }

</style>
