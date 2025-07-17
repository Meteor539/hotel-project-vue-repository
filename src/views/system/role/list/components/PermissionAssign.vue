<template>
  <el-dialog
    v-model="dialogVisible"
    title="分配权限"
    width="600px"
    :close-on-click-modal="false"
  >
    <div class="role-info">
      <h4>角色信息</h4>
      <p><strong>角色名称：</strong>{{ currentRole.roleName }}</p>
      <p><strong>角色状态：</strong>
        <el-tag :type="currentRole.roleStatus === '激活' ? 'success' : 'danger'">
          {{ currentRole.roleStatus }}
        </el-tag>
      </p>
    </div>

    <el-divider />

    <div class="permission-section">
      <h4>权限分配</h4>
      <div v-loading="permissionLoading" class="permission-list">
        <el-checkbox-group v-model="selectedPermissions">
          <div class="permission-category" v-for="category in permissionCategories" :key="category.name">
            <h5>{{ category.name }}</h5>
            <div class="permission-items">
              <el-checkbox
                v-for="permission in category.permissions"
                :key="permission.id"
                :label="permission.id"
                class="permission-item"
              >
                {{ permission.name }}
              </el-checkbox>
            </div>
          </div>
        </el-checkbox-group>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          保存权限
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getActivePermissionsAPI, 
  getRolePermissionIdsAPI, 
  updateRolePermissionsAPI 
} from '@/apis/rbacAPI'

const emit = defineEmits(['refresh'])

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)
const permissionLoading = ref(false)
const allPermissions = ref([])
const selectedPermissions = ref([])

// 当前角色信息
const currentRole = reactive({
  roleId: null,
  roleName: '',
  roleStatus: ''
})

// 权限分类
const permissionCategories = computed(() => {
  const categories = {
    '房间管理': [],
    '分店管理': [],
    '用户管理': [],
    '角色管理': [],
    '权限管理': []
  }

  allPermissions.value.forEach(permission => {
    const code = permission.code || permission.permCode
    if (code.startsWith('room:')) {
      categories['房间管理'].push(permission)
    } else if (code.startsWith('branch:')) {
      categories['分店管理'].push(permission)
    } else if (code.startsWith('sysuser:')) {
      categories['用户管理'].push(permission)
    } else if (code.startsWith('role:')) {
      categories['角色管理'].push(permission)
    } else if (code.startsWith('permission:')) {
      categories['权限管理'].push(permission)
    }
  })

  return Object.entries(categories)
    .filter(([, permissions]) => permissions.length > 0)
    .map(([name, permissions]) => ({ name, permissions }))
})

// 打开对话框
const open = async (roleData) => {
  currentRole.roleId = roleData.roleId
  currentRole.roleName = roleData.roleName
  currentRole.roleStatus = roleData.roleStatus
  
  dialogVisible.value = true
  
  // 加载权限数据
  await Promise.all([
    loadAllPermissions(),
    loadRolePermissions()
  ])
}

// 加载所有权限
const loadAllPermissions = async () => {
  try {
    permissionLoading.value = true
    const res = await getActivePermissionsAPI()
    
    if (res && res.code === 200 && res.data) {
      allPermissions.value = (res.data || []).map(permission => ({
        id: permission.id || permission.permId,
        name: permission.name || permission.permName,
        code: permission.code || permission.permCode
      }))
    }
  } catch (error) {
    console.error('加载权限列表失败:', error)
    ElMessage.error('加载权限列表失败')
  } finally {
    permissionLoading.value = false
  }
}

// 加载角色已有权限
const loadRolePermissions = async () => {
  try {
    const res = await getRolePermissionIdsAPI(currentRole.roleId)
    
    if (res && res.code === 200 && res.data) {
      selectedPermissions.value = res.data || []
    }
  } catch (error) {
    console.error('加载角色权限失败:', error)
    ElMessage.error('加载角色权限失败')
  }
}

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false
  resetData()
}

// 处理提交
const handleSubmit = async () => {
  try {
    loading.value = true
    
    await updateRolePermissionsAPI({
      roleId: currentRole.roleId,
      permIds: selectedPermissions.value
    })
    
    ElMessage.success('权限分配成功')
    dialogVisible.value = false
    resetData()
    emit('refresh')
  } catch (error) {
    console.error('权限分配失败:', error)
    ElMessage.error('权限分配失败')
  } finally {
    loading.value = false
  }
}

// 重置数据
const resetData = () => {
  currentRole.roleId = null
  currentRole.roleName = ''
  currentRole.roleStatus = ''
  allPermissions.value = []
  selectedPermissions.value = []
}

// 暴露方法
defineExpose({
  open
})
</script>

<style scoped>
.role-info {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.role-info h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.role-info p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.permission-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
}

.permission-list {
  max-height: 400px;
  overflow-y: auto;
}

.permission-category {
  margin-bottom: 20px;
}

.permission-category h5 {
  margin: 0 0 12px 0;
  color: #409eff;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 8px;
}

.permission-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  padding-left: 16px;
}

.permission-item {
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 滚动条样式 */
.permission-list::-webkit-scrollbar {
  width: 6px;
}

.permission-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.permission-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.permission-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
