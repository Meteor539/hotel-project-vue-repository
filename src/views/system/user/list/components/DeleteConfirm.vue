<template>
  <el-dialog
    v-model="dialogVisible"
    title="删除用户"
    width="500px"
    :close-on-click-modal="false"
  >
    <div class="delete-content">
      <el-icon class="warning-icon" color="#E6A23C" size="48">
        <WarningFilled />
      </el-icon>
      <div class="message">
        <p>您确定要删除用户吗？</p>
        <div class="user-info">
          <p><strong>用户ID：</strong>{{ currentUser.userId }}</p>
          <p><strong>用户姓名：</strong>{{ currentUser.userName }}</p>
          <p><strong>所属分店：</strong>{{ currentUser.branchName || '系统管理员' }}</p>
        </div>
        <p class="warning-text">删除后将无法恢复，请谨慎操作！</p>
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
import { deleteSysUserAPI } from '@/apis/rbacAPI'

const emit = defineEmits(['refresh'])

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)

// 当前要删除的用户
const currentUser = reactive({
  userId: '',
  userName: '',
  branchName: ''
})

// 打开对话框
const open = (userData) => {
  currentUser.userId = userData.userId
  currentUser.userName = userData.userName
  currentUser.branchName = userData.branchName
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
    
    await deleteSysUserAPI(currentUser.userId)
    
    ElMessage.success('删除用户成功')
    dialogVisible.value = false
    resetData()
    emit('refresh')
  } catch (error) {
    console.error('删除用户失败:', error)
    ElMessage.error('删除用户失败')
  } finally {
    loading.value = false
  }
}

// 重置数据
const resetData = () => {
  currentUser.userId = ''
  currentUser.userName = ''
  currentUser.branchName = ''
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

.user-info {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin: 12px 0;
}

.user-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
}

.user-info p:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: #E6A23C !important;
  font-weight: 500;
  font-size: 14px !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
