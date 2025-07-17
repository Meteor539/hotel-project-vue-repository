<template>
  <div class="system-role">
    <div class="wrapper">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="角色名称">
            <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable />
          </el-form-item>
          <el-form-item label="角色状态">
            <el-select v-model="searchForm.roleStatus" placeholder="请选择状态" clearable>
              <el-option label="激活" value="a" />
              <el-option label="禁用" value="d" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="operation-buttons">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增角色</el-button>
      </div>

      <!-- 角色列表表格 -->
      <el-table 
        :data="roleList" 
        border 
        style="width: 100%; background: white;"
        v-loading="loading"
        :header-row-style="{color:'#555',textAlign:'center'}"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="roleId" label="角色ID" width="80" align="center" />
        <el-table-column prop="roleName" label="角色名称" width="150" align="center" />
        <el-table-column prop="roleStatus" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.roleStatus === '激活' ? 'success' : 'danger'">
              {{ scope.row.roleStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permissionCount" label="权限数量" width="100" align="center">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.permissionCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userCount" label="用户数量" width="100" align="center">
          <template #default="scope">
            <el-tag type="warning">{{ scope.row.userCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column prop="createdBy" label="创建人" width="100" align="center" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="EditPen" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="success" @click="handleAssignPermissions(scope.row)">
              分配权限
            </el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <Page 
          :total="total" 
          :page-size="pageSize" 
          :current-page="currPageNo" 
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange" 
        />
      </div>
    </div>

    <!-- 新增/编辑角色对话框 -->
    <RoleForm 
      ref="roleFormRef" 
      @refresh="loadPagedRoles" 
    />

    <!-- 权限分配对话框 -->
    <PermissionAssign 
      ref="permissionAssignRef" 
      @refresh="loadPagedRoles" 
    />

    <!-- 删除确认对话框 -->
    <DeleteConfirm 
      ref="deleteConfirmRef" 
      @refresh="loadPagedRoles" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, Delete, Plus } from '@element-plus/icons-vue'
import { getRolePageAPI, getRolePermissionsByRoleIdAPI, getUserRolesByRoleIdAPI } from '@/apis/rbacAPI'
import { useUserStore } from '@/stores/user'
import Page from '@/components/Page.vue'
import RoleForm from './components/RoleForm.vue'
import PermissionAssign from './components/PermissionAssign.vue'
import DeleteConfirm from './components/DeleteConfirm.vue'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const roleList = ref([])
const total = ref(0)
const pageSize = ref(8)
const currPageNo = ref(1)

// 搜索表单
const searchForm = reactive({
  roleName: '',
  roleStatus: ''
})

// 组件引用
const roleFormRef = ref()
const permissionAssignRef = ref()
const deleteConfirmRef = ref()

// 搜索处理
const handleSearch = () => {
  currPageNo.value = 1
  loadPagedRoles(1)
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currPageNo.value = 1
  loadPagedRoles(1)
}

// 新增角色
const handleAdd = () => {
  // 检查权限
  if (!userStore.hasPermission('role:create')) {
    ElMessage.error('您没有新增角色的权限')
    return
  }
  roleFormRef.value.open()
}

// 编辑角色
const handleEdit = (row) => {
  // 检查权限
  if (!userStore.hasPermission('role:update')) {
    ElMessage.error('您没有编辑角色的权限')
    return
  }
  roleFormRef.value.open(row)
}

// 分配权限
const handleAssignPermissions = (row) => {
  // 检查权限
  if (!userStore.hasPermission('role:update')) {
    ElMessage.error('您没有分配权限的权限')
    return
  }
  permissionAssignRef.value.open(row)
}

// 删除角色
const handleDelete = (row) => {
  // 检查权限
  if (!userStore.hasPermission('role:delete')) {
    ElMessage.error('您没有删除角色的权限')
    return
  }
  deleteConfirmRef.value.open(row)
}

// 分页大小改变
const handleSizeChange = (size) => {
  pageSize.value = size
  loadPagedRoles(currPageNo.value)
}

// 当前页改变
const handleCurrentChange = (page) => {
  currPageNo.value = page
  loadPagedRoles(page)
}

// 加载分页角色数据
const loadPagedRoles = async (pageNo = 1) => {
  try {
    loading.value = true

    const res = await getRolePageAPI(pageNo, pageSize.value)
    
    if (res && res.code === 200 && res.data) {
      const pageData = res.data
      let roles = pageData.records || pageData.list || pageData || []
      
      // 处理角色数据
      roleList.value = await Promise.all(roles.map(async (role) => {
        const roleId = role.id || role.roleId

        // 获取角色权限数量
        let permissionCount = 0
        try {
          const permRes = await getRolePermissionsByRoleIdAPI(roleId)
          if (permRes && permRes.code === 200 && permRes.data) {
            permissionCount = permRes.data.length
          }
        } catch (error) {
          console.error('获取角色权限失败:', error)
        }

        // 获取角色用户数量
        let userCount = 0
        try {
          const userRes = await getUserRolesByRoleIdAPI(roleId)
          if (userRes && userRes.code === 200 && userRes.data) {
            userCount = userRes.data.length
          }
        } catch (error) {
          console.error('获取角色用户失败:', error)
        }

        return {
          roleId,
          roleName: role.name || role.roleName,
          roleStatus: role.status === 'a' ? '激活' : '禁用',
          permissionCount,
          userCount,
          createTime: formatDateTime(role.createTime),
          createdBy: role.createdBy
        }
      }))

      total.value = pageData.total || pageData.totalCount || roles.length
      currPageNo.value = pageData.current || pageData.pageNo || pageNo
    } else {
      ElMessage.error('获取角色列表失败')
    }
  } catch (error) {
    console.error('加载角色数据失败:', error)
    ElMessage.error('加载角色数据失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 页面挂载时加载数据
onMounted(() => {
  loadPagedRoles(1)
})
</script>

<style scoped>
.system-role {
  padding: 20px;
}

.wrapper {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.operation-buttons {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-table {
  margin-bottom: 20px;
}
</style>
