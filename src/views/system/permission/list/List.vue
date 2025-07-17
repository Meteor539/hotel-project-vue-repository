<template>
  <div class="system-permission">
    <div class="wrapper">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="权限名称">
            <el-input v-model="searchForm.permName" placeholder="请输入权限名称" clearable />
          </el-form-item>
          <el-form-item label="权限代码">
            <el-input v-model="searchForm.permCode" placeholder="请输入权限代码" clearable />
          </el-form-item>
          <el-form-item label="权限状态">
            <el-select v-model="searchForm.permStatus" placeholder="请选择状态" clearable>
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
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增权限</el-button>
      </div>

      <!-- 权限列表表格 -->
      <el-table 
        :data="permissionList" 
        border 
        style="width: 100%; background: white;"
        v-loading="loading"
        :header-row-style="{color:'#555',textAlign:'center'}"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="permId" label="权限ID" width="80" align="center" />
        <el-table-column prop="permName" label="权限名称" width="150" align="center" />
        <el-table-column prop="permCode" label="权限代码" width="150" align="center">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.permCode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permStatus" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.permStatus === '激活' ? 'success' : 'danger'">
              {{ scope.row.permStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roleCount" label="角色数量" width="100" align="center">
          <template #default="scope">
            <el-tag type="warning">{{ scope.row.roleCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column prop="createdBy" label="创建人" width="100" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="EditPen" @click="handleEdit(scope.row)">
              编辑
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

    <!-- 新增/编辑权限对话框 -->
    <PermissionForm 
      ref="permissionFormRef" 
      @refresh="loadPagedPermissions" 
    />

    <!-- 删除确认对话框 -->
    <DeleteConfirm 
      ref="deleteConfirmRef" 
      @refresh="loadPagedPermissions" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { EditPen, Delete, Plus } from '@element-plus/icons-vue'
import { getPermissionPageAPI, getRoleIdsByPermissionIdAPI } from '@/apis/rbacAPI'
import { useUserStore } from '@/stores/user'
import Page from '@/components/Page.vue'
import PermissionForm from './components/PermissionForm.vue'
import DeleteConfirm from './components/DeleteConfirm.vue'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const permissionList = ref([])
const total = ref(0)
const pageSize = ref(8)
const currPageNo = ref(1)

// 搜索表单
const searchForm = reactive({
  permName: '',
  permCode: '',
  permStatus: ''
})

// 组件引用
const permissionFormRef = ref()
const deleteConfirmRef = ref()

// 搜索处理
const handleSearch = () => {
  currPageNo.value = 1
  loadPagedPermissions(1)
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currPageNo.value = 1
  loadPagedPermissions(1)
}

// 新增权限
const handleAdd = () => {
  // 检查权限
  if (!userStore.hasPermission('permission:create')) {
    ElMessage.error('您没有新增权限的权限')
    return
  }
  permissionFormRef.value.open()
}

// 编辑权限
const handleEdit = (row) => {
  // 检查权限
  if (!userStore.hasPermission('permission:update')) {
    ElMessage.error('您没有编辑权限的权限')
    return
  }
  permissionFormRef.value.open(row)
}

// 删除权限
const handleDelete = (row) => {
  // 检查权限
  if (!userStore.hasPermission('permission:delete')) {
    ElMessage.error('您没有删除权限的权限')
    return
  }
  deleteConfirmRef.value.open(row)
}

// 分页大小改变
const handleSizeChange = (size) => {
  pageSize.value = size
  loadPagedPermissions(currPageNo.value)
}

// 当前页改变
const handleCurrentChange = (page) => {
  currPageNo.value = page
  loadPagedPermissions(page)
}

// 加载分页权限数据
const loadPagedPermissions = async (pageNo = 1) => {
  try {
    loading.value = true

    const res = await getPermissionPageAPI(pageNo, pageSize.value)
    
    if (res && res.code === 200 && res.data) {
      const pageData = res.data
      let permissions = pageData.records || pageData.list || pageData || []
      
      // 处理权限数据
      permissionList.value = await Promise.all(permissions.map(async (permission) => {
        const permId = permission.id || permission.permId
        
        // 获取权限对应的角色数量
        let roleCount = 0
        try {
          const roleRes = await getRoleIdsByPermissionIdAPI(permId)
          if (roleRes && roleRes.code === 200 && roleRes.data) {
            roleCount = roleRes.data.length
          }
        } catch (error) {
          console.error('获取权限角色失败:', error)
        }

        return {
          permId,
          permName: permission.name || permission.permName,
          permCode: permission.code || permission.permCode,
          permStatus: permission.status === 'a' ? '激活' : '禁用',
          roleCount,
          createTime: formatDateTime(permission.createTime),
          createdBy: permission.createdBy
        }
      }))

      total.value = pageData.total || pageData.totalCount || permissions.length
      currPageNo.value = pageData.current || pageData.pageNo || pageNo
    } else {
      ElMessage.error('获取权限列表失败')
    }
  } catch (error) {
    console.error('加载权限数据失败:', error)
    ElMessage.error('加载权限数据失败')
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
  loadPagedPermissions(1)
})
</script>

<style scoped>
.system-permission {
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
