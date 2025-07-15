<template>
    <!-- 顶部区域 -->
    <div class="header">
        <el-row>
            <el-col :span="4">
                <el-icon v-if="!props.isCollapse" @click="foldMenu"><Fold /></el-icon>
                <el-icon v-else @click="foldMenu"><Expand /></el-icon>
            </el-col>
            <el-col :span="20">
                <div class="right">
                    <el-dropdown @command="handleCommand">
                        <span class="user-info">
                            <el-icon><User /></el-icon>
                            {{ userStore.userInfo.username || '未登录' }}
                            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-col>
        </el-row>
    </div>
    <!-- 路由出口 -->
    <RouterView/>
</template>

<script setup>

   import {
    Expand, Fold, User, ArrowDown
   } from '@element-plus/icons-vue'
   import { useUserStore } from '@/stores/counter'
   import { useRouter } from 'vue-router'
   import { ElMessage, ElMessageBox } from 'element-plus'

   const props = defineProps(['isCollapse']);
   const emit = defineEmits(['changeCollapse']);
   const userStore = useUserStore()
   const router = useRouter()

   const foldMenu = () => {
       console.log("fold menu!");
       emit('changeCollapse');
   }

   // 处理下拉菜单命令
   const handleCommand = async (command) => {
       if (command === 'logout') {
           try {
               await ElMessageBox.confirm(
                   '您确定要退出登录吗？退出后需要重新登录才能访问系统。',
                   '退出登录',
                   {
                       confirmButtonText: '确定退出',
                       cancelButtonText: '取消',
                       type: 'warning',
                       center: true,
                       customClass: 'custom-message-box',
                       appendTo: document.body,
                       distinguishCancelAndClose: true,
                       closeOnClickModal: false,
                       showClose: false
                   }
               )

               // 退出登录
               userStore.logout()
               ElMessage.success('退出登录成功')
               router.push('/login')
           } catch {
               // 用户取消操作
           }
       }
   }


</script>

<style lang="scss" scoped>
  
  .wrapper{
     padding: 10px;
  }
  
  .header{
     
     background-color: #1e78bf;
     height: 50px;
     line-height: 50px;
     color:#fff;

     .right{
        text-align: right;
        padding-right: 20px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 100%;

        .user-info {
           cursor: pointer;
           display: inline-flex;
           align-items: center;
           gap: 5px;
           padding: 8px 12px;
           border-radius: 4px;
           transition: background-color 0.3s;
           color: #ffffff;

           &:hover {
              background-color: rgba(255, 255, 255, 0.1);
           }
        }
     }

     .el-icon{
        font-size: 22px;
        cursor: pointer;
     }

  }

  /* 确保下拉菜单正确显示 */
  :deep(.el-dropdown-menu) {
     z-index: 9999;
  }

  /* 确保消息框正确显示 */
  :deep(.el-message-box) {
     z-index: 10000;
  }
</style>

<style>
/* 全局样式，修复消息框定位和美化样式 */
.custom-message-box {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  z-index: 10001 !important;
  margin: 0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  min-width: 420px !important;
  background-color: #ffffff !important;
  border: 1px solid #ebeef5 !important;
}

.custom-message-box .el-message-box__header {
  padding: 20px 20px 10px !important;
  border-bottom: 1px solid #ebeef5 !important;
  background-color: #ffffff !important;
  border-radius: 8px 8px 0 0 !important;
}

.custom-message-box .el-message-box__title {
  font-size: 16px !important;
  font-weight: 600 !important;
  color: #303133 !important;
}

.custom-message-box .el-message-box__content {
  padding: 20px !important;
  color: #606266 !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  background-color: #ffffff !important;
}

.custom-message-box .el-message-box__btns {
  padding: 10px 20px 20px !important;
  text-align: right !important;
  border-top: 1px solid #ebeef5 !important;
  background-color: #ffffff !important;
  border-radius: 0 0 8px 8px !important;
}

.custom-message-box .el-button {
  margin-left: 10px !important;
  padding: 8px 20px !important;
  border-radius: 4px !important;
  font-size: 14px !important;
}

.custom-message-box .el-button--primary {
  background-color: #409eff !important;
  border-color: #409eff !important;
}

.custom-message-box .el-button--primary:hover {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
}

.custom-message-box .el-button--default {
  color: #606266 !important;
  border-color: #dcdfe6 !important;
  background-color: #fff !important;
}

.custom-message-box .el-button--default:hover {
  color: #409eff !important;
  border-color: #c6e2ff !important;
  background-color: #ecf5ff !important;
}

.custom-message-box .el-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 10000 !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
}

</style>
