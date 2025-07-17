<template>
  <div class="user">
    <div class="wrapper">
      <div class="title">系统用户管理</div>
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="用户名">
            <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="用户状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchUsers">搜 索</el-button>
            <el-button @click="resetSearch">重 置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="warning" :icon="Plus" @click="addUser">新增用户</el-button>
        <el-button type="danger" :icon="Delete" @click="handleBatchDelete">批量删除</el-button>
      </div>

      <!-- 用户列表表格 -->
      <el-table
        :data="userList"
        style="width: 100%; background: white;"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        border
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="用户ID" width="80" />
        <el-table-column prop="userName" label="用户名" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="roles" label="角色" width="200">
          <template #default="scope">
            <el-tag
              v-for="role in scope.row.roles"
              :key="role.id"
              :type="getRoleTagType(role.roleName)"
              size="small"
              style="margin-right: 5px;"
            >
              {{ role.roleName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="editUser(scope.row)">编辑</el-button>
            <el-button 
              :type="scope.row.status === 1 ? 'warning' : 'success'" 
              size="small" 
              @click="toggleUserStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="deleteUser(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[8, 16, 24, 32]"
          :small="false"
          :disabled="false"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getUserListAPI, deleteUserAPI, updateUserStatusAPI } from '@/apis/rbacAPI'

const router = useRouter()

// 响应式数据
const userList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)
const selectedUsers = ref([])

// 搜索表单
const searchForm = reactive({
  userName: '',
  status: ''
})

// 获取角色标签类型
const getRoleTagType = (roleName) => {
  const typeMap = {
    '超级管理员': 'danger',
    '管理员': 'warning',
    '经理': 'primary',
    '员工': 'info'
  }
  return typeMap[roleName] || 'info'
}

// 加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true
    const res = await getUserListAPI()
    
    if (res.code === 1 && res.data) {
      let filteredUsers = res.data
      
      // 应用搜索过滤
      if (searchForm.userName) {
        filteredUsers = filteredUsers.filter(user => 
          user.userName.toLowerCase().includes(searchForm.userName.toLowerCase())
        )
      }
      
      if (searchForm.status !== '') {
        filteredUsers = filteredUsers.filter(user => user.status == searchForm.status)
      }
      
      // 分页处理
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      
      // 格式化用户数据
      const formattedUsers = filteredUsers.map(user => ({
        ...user,
        roles: user.roles || [],
        createTime: formatDateTime(user.createTime)
      }))
      
      userList.value = formattedUsers.slice(start, end)
      total.value = filteredUsers.length
    } else {
      ElMessage.error(res.msg || '获取用户列表失败')
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 搜索用户
const searchUsers = () => {
  currentPage.value = 1
  loadUsers()
}

// 重置搜索
const resetSearch = () => {
  searchForm.userName = ''
  searchForm.status = ''
  currentPage.value = 1
  loadUsers()
}

// 新增用户
const addUser = () => {
  router.push('/user/add')
}

// 编辑用户
const editUser = (user) => {
  router.push({
    path: '/user/add',
    query: {
      id: user.id,
      mode: 'edit'
    }
  })
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  try {
    const newStatus = user.status === 1 ? 0 : 1
    const statusText = newStatus === 1 ? '启用' : '禁用'
    
    await ElMessageBox.confirm(
      `确定要${statusText}用户 "${user.userName}" 吗？`,
      '状态变更确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await updateUserStatusAPI(user.id, newStatus)
    if (res.code === 1) {
      ElMessage.success(`${statusText}成功`)
      loadUsers() // 重新加载数据
    } else {
      ElMessage.error(res.msg || `${statusText}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('状态变更失败')
    }
  }
}

// 删除用户
const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.userName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await deleteUserAPI(user.id)
    if (res.code === 1) {
      ElMessage.success('删除成功')
      loadUsers() // 重新加载数据
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 批量删除用户
    const deletePromises = selectedUsers.value.map(user => deleteUserAPI(user.id))
    await Promise.all(deletePromises)
    
    ElMessage.success('批量删除成功')
    selectedUsers.value = []
    loadUsers() // 重新加载数据
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 处理页面大小变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  loadUsers()
}

// 处理当前页变化
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  loadUsers()
}

// 页面加载时获取数据
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user {
  padding: 20px;
}

.wrapper {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.search-form {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
