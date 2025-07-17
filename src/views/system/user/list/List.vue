<template>
  <div class="system-user">
    <div class="wrapper">
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="用户ID">
            <el-input v-model="searchForm.userId" placeholder="请输入用户ID" clearable />
          </el-form-item>
          <el-form-item label="用户姓名">
            <el-input v-model="searchForm.userName" placeholder="请输入用户姓名" clearable />
          </el-form-item>
          <el-form-item label="用户状态">
            <el-select v-model="searchForm.userStatus" placeholder="请选择状态" clearable>
              <el-option label="正常" value="a" />
              <el-option label="禁用" value="d" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属分店">
            <el-select v-model="searchForm.branchId" placeholder="请选择分店" clearable>
              <el-option label="系统管理员" :value="null" />
              <el-option 
                v-for="branch in branchList" 
                :key="branch.id" 
                :label="branch.name" 
                :value="branch.id" 
              />
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
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
      </div>

      <!-- 用户列表表格 -->
      <el-table 
        :data="userList" 
        border 
        style="width: 100%; background: white;"
        v-loading="loading"
        :header-row-style="{color:'#555',textAlign:'center'}"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userId" label="用户ID" width="100" align="center" />
        <el-table-column prop="userName" label="用户姓名" width="120" align="center" />
        <el-table-column prop="userStatus" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.userStatus === '正常' ? 'success' : 'danger'">
              {{ scope.row.userStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="branchName" label="所属分店" width="150" align="center">
          <template #default="scope">
            {{ scope.row.branchName || '系统管理员' }}
          </template>
        </el-table-column>
        <el-table-column prop="roles" label="用户角色" min-width="200" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column prop="createdBy" label="创建人" width="100" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" :icon="EditPen" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="warning" @click="handleResetPassword(scope.row)">
              重置密码
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

    <!-- 新增/编辑用户对话框 -->
    <UserForm 
      ref="userFormRef" 
      @refresh="loadPagedUsers" 
    />

    <!-- 删除确认对话框 -->
    <DeleteConfirm 
      ref="deleteConfirmRef" 
      @refresh="loadPagedUsers" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, Delete, Plus } from '@element-plus/icons-vue'
import { getSysUserPageAPI, resetSysUserPasswordAPI } from '@/apis/rbacAPI'
import { getAllBranchesAPI } from '@/apis/branchAPI'
import { useUserStore } from '@/stores/user'
import Page from '@/components/Page.vue'
import UserForm from './components/UserForm.vue'
import DeleteConfirm from './components/DeleteConfirm.vue'

const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const userList = ref([])
const branchList = ref([])
const total = ref(0)
const pageSize = ref(8)
const currPageNo = ref(1)

// 搜索表单
const searchForm = reactive({
  userId: '',
  userName: '',
  userStatus: '',
  branchId: ''
})

// 组件引用
const userFormRef = ref()
const deleteConfirmRef = ref()

// 搜索处理
const handleSearch = () => {
  currPageNo.value = 1
  loadPagedUsers(1)
}

// 重置搜索
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currPageNo.value = 1
  loadPagedUsers(1)
}

// 新增用户
const handleAdd = () => {
  // 检查权限
  if (!userStore.hasPermission('sysuser:create')) {
    ElMessage.error('您没有新增用户的权限')
    return
  }
  userFormRef.value.open()
}

// 编辑用户
const handleEdit = (row) => {
  // 检查权限
  if (!userStore.hasPermission('sysuser:update')) {
    ElMessage.error('您没有编辑用户的权限')
    return
  }
  userFormRef.value.open(row)
}

// 重置密码
const handleResetPassword = async (row) => {
  // 检查权限
  if (!userStore.hasPermission('sysuser:update')) {
    ElMessage.error('您没有重置密码的权限')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要重置用户"${row.userName}"的密码吗？密码将重置为"123456"`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await resetSysUserPasswordAPI({
      userId: row.userId,
      newPassword: '123456'
    })

    ElMessage.success('密码重置成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败')
    }
  }
}

// 删除用户
const handleDelete = (row) => {
  // 检查权限
  if (!userStore.hasPermission('sysuser:delete')) {
    ElMessage.error('您没有删除用户的权限')
    return
  }
  deleteConfirmRef.value.open(row)
}

// 分页大小改变
const handleSizeChange = (size) => {
  pageSize.value = size
  loadPagedUsers(currPageNo.value)
}

// 当前页改变
const handleCurrentChange = (page) => {
  currPageNo.value = page
  loadPagedUsers(page)
}

// 加载分页用户数据
const loadPagedUsers = async (pageNo = 1) => {
  try {
    loading.value = true

    const res = await getSysUserPageAPI(pageNo, pageSize.value)
    
    if (res && res.code === 200 && res.data) {
      const pageData = res.data
      let users = pageData.records || pageData.list || pageData || []
      
      // 处理用户数据
      userList.value = users.map(user => ({
        userId: user.userId,
        userName: user.userName,
        userStatus: user.userStatus === 'a' ? '正常' : '禁用',
        branchId: user.branchId,
        branchName: getBranchNameById(user.branchId),
        roles: formatRoles(user.roleList || []),
        createTime: formatDateTime(user.createTime),
        createdBy: user.createdBy
      }))

      total.value = pageData.total || pageData.totalCount || users.length
      currPageNo.value = pageData.current || pageData.pageNo || pageNo
    } else {
      ElMessage.error('获取用户列表失败')
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('加载用户数据失败')
  } finally {
    loading.value = false
  }
}

// 加载分店列表
const loadBranches = async () => {
  try {
    const res = await getAllBranchesAPI()
    if (res && res.data) {
      branchList.value = (res.data || []).map(branch => ({
        id: branch.id || branch.branchId,
        name: branch.name || branch.branchName
      }))
    }
  } catch (error) {
    console.error('加载分店列表失败:', error)
  }
}

// 根据分店ID获取分店名称
const getBranchNameById = (branchId) => {
  if (!branchId) return '系统管理员'
  const branch = branchList.value.find(b => b.id === branchId)
  return branch ? branch.name : '未知分店'
}

// 格式化角色列表
const formatRoles = (roleList) => {
  if (!roleList || roleList.length === 0) return '无角色'
  return roleList.map(role => role.name || role.roleName).join(', ')
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
onMounted(async () => {
  await loadBranches()
  loadPagedUsers(1)
})
</script>

<style scoped>
.system-user {
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
