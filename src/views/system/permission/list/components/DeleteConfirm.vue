<template>
  <el-dialog
    v-model="dialogVisible"
    title="删除权限"
    width="500px"
    :close-on-click-modal="false"
  >
    <div class="delete-content">
      <el-icon class="warning-icon" color="#E6A23C" size="48">
        <WarningFilled />
      </el-icon>
      <div class="message">
        <p>您确定要删除权限吗？</p>
        <div class="permission-info">
          <p><strong>权限ID：</strong>{{ currentPermission.permId }}</p>
          <p><strong>权限名称：</strong>{{ currentPermission.permName }}</p>
          <p><strong>权限代码：</strong>{{ currentPermission.permCode }}</p>
          <p><strong>角色数量：</strong>{{ currentPermission.roleCount }}</p>
        </div>
        <p class="warning-text">删除后将无法恢复，请谨慎操作！</p>
        <p v-if="currentPermission.roleCount > 0" class="error-text">
          注意：该权限被 {{ currentPermission.roleCount }} 个角色使用，删除后这些角色将失去该权限！
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
import { deletePermissionAPI } from '@/apis/rbacAPI'

const emit = defineEmits(['refresh'])

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)

// 当前要删除的权限
const currentPermission = reactive({
  permId: null,
  permName: '',
  permCode: '',
  roleCount: 0
})

// 打开对话框
const open = (permissionData) => {
  currentPermission.permId = permissionData.permId
  currentPermission.permName = permissionData.permName
  currentPermission.permCode = permissionData.permCode
  currentPermission.roleCount = permissionData.roleCount
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
    
    await deletePermissionAPI(currentPermission.permId)
    
    ElMessage.success('删除权限成功')
    dialogVisible.value = false
    resetData()
    emit('refresh')
  } catch (error) {
    console.error('删除权限失败:', error)
    ElMessage.error('删除权限失败')
  } finally {
    loading.value = false
  }
}

// 重置数据
const resetData = () => {
  currentPermission.permId = null
  currentPermission.permName = ''
  currentPermission.permCode = ''
  currentPermission.roleCount = 0
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

.permission-info {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin: 12px 0;
}

.permission-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

.permission-info p:last-child {
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
