<template>
  <el-dialog
    v-model="dialogVisible"
    title="删除角色"
    width="500px"
    :close-on-click-modal="false"
  >
    <div class="delete-content">
      <el-icon class="warning-icon" color="#E6A23C" size="48">
        <WarningFilled />
      </el-icon>
      <div class="message">
        <p>您确定要删除角色吗？</p>
        <div class="role-info">
          <p><strong>角色ID：</strong>{{ currentRole.roleId }}</p>
          <p><strong>角色名称：</strong>{{ currentRole.roleName }}</p>
          <p><strong>权限数量：</strong>{{ currentRole.permissionCount }}</p>
          <p><strong>用户数量：</strong>{{ currentRole.userCount }}</p>
        </div>
        <p class="warning-text">删除后将无法恢复，请谨慎操作！</p>
        <p v-if="currentRole.userCount > 0" class="error-text">
          注意：该角色下还有 {{ currentRole.userCount }} 个用户，删除后这些用户将失去该角色权限！
        </p>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="danger" :loading="loading" @click="handleConfirm">
          确定删除
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { deleteRoleAPI } from '@/apis/rbacAPI'

const emit = defineEmits(['refresh'])

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)

// 当前要删除的角色
const currentRole = reactive({
  roleId: null,
  roleName: '',
  permissionCount: 0,
  userCount: 0
})

// 打开对话框
const open = (roleData) => {
  currentRole.roleId = roleData.roleId
  currentRole.roleName = roleData.roleName
  currentRole.permissionCount = roleData.permissionCount
  currentRole.userCount = roleData.userCount
  dialogVisible.value = true
}

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false
  resetData()
}

// 处理确认删除
const handleConfirm = async () => {
  try {
    loading.value = true
    
    await deleteRoleAPI(currentRole.roleId)
    
    ElMessage.success('删除角色成功')
    dialogVisible.value = false
    resetData()
    emit('refresh')
  } catch (error) {
    console.error('删除角色失败:', error)
    ElMessage.error('删除角色失败')
  } finally {
    loading.value = false
  }
}

// 重置数据
const resetData = () => {
  currentRole.roleId = null
  currentRole.roleName = ''
  currentRole.permissionCount = 0
  currentRole.userCount = 0
}

// 暴露方法
defineExpose({
  open
})
</script>

<style scoped>
.delete-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
}

.warning-icon {
  flex-shrink: 0;
  margin-top: 4px;
}

.message {
  flex: 1;
}

.message p {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
}

.role-info {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin: 12px 0;
}

.role-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

.role-info p:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: #E6A23C !important;
  font-weight: 500;
  font-size: 14px !important;
}

.error-text {
  color: #F56C6C !important;
  font-weight: 500;
  font-size: 14px !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
