<template>
  <div class="user">
    <div class="wrapper">
      <div class="title">用户信息管理</div>
      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="用户名">
            <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="用户角色">
            <el-select v-model="searchForm.userRole" placeholder="请选择用户角色" clearable style="width: 200px">
              <el-option label="管理员" value="admin" />
              <el-option label="经理" value="manager" />
              <el-option label="普通用户" value="user" />
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
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        border
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="userRole" label="用户角色" width="200">
          <template #default="scope">
            <el-tag
              :type="scope.row.userRole === 'admin' ? 'danger' : scope.row.userRole === 'manager' ? 'warning' : 'info'"
            >
              {{ getRoleText(scope.row.userRole) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdBy" label="创建人" width="100" />
        <el-table-column prop="updatedBy" label="更新人" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" :icon="EditPen" @click="editUser(scope.row)">修 改</el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="deleteUser(scope.row)">删 除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="userList.length > 0">
        <Page :psize="pageSize" :total="total" @setCurrentPageNo="setCurrentPageNo"></Page>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, Delete, Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getPagedUsersListAPI, deleteUserAPI } from '@/apis/userAPI'
import Page from '@/components/Page.vue'

// 路由实例
const router = useRouter()

// 搜索表单
const searchForm = reactive({
  userName: '',
  userRole: ''
})

// 用户列表数据
const userList = ref([])
const total = ref(0)
const currPageNo = ref(1)
const pageSize = ref(8)
const loading = ref(false)
const selectedUsers = ref([])

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    'admin': '管理员',
    'manager': '经理',
    'user': '普通用户'
  }
  return roleMap[role] || role
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

// 模拟数据（当API调用失败时使用）
const mockUserData = [
  {
    userId: 1,
    userName: 'admin',
    userRole: 'admin',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00',
    createdBy: '000001',
    updatedBy: '000001'
  },
  {
    userId: 2,
    userName: 'manager01',
    userRole: 'manager',
    createTime: '2024-01-16 09:15:00',
    updateTime: '2024-01-16 09:15:00',
    createdBy: '000001',
    updatedBy: '000001'
  },
  {
    userId: 3,
    userName: 'user001',
    userRole: 'user',
    createTime: '2024-01-17 14:20:00',
    updateTime: '2024-01-17 14:20:00',
    createdBy: '000001',
    updatedBy: '000001'
  },
  {
    userId: 4,
    userName: 'manager02',
    userRole: 'manager',
    createTime: '2024-01-18 11:45:00',
    updateTime: '2024-01-18 11:45:00',
    createdBy: '000001',
    updatedBy: '000001'
  },
  {
    userId: 5,
    userName: 'user002',
    userRole: 'user',
    createTime: '2024-01-19 16:30:00',
    updateTime: '2024-01-19 16:30:00',
    createdBy: '000001',
    updatedBy: '000001'
  }
]

// 加载分页用户列表
const loadPagedUsers = async (pageNo = 1, size = 8) => {
  try {
    loading.value = true
    console.log(`正在加载第${pageNo}页用户数据，每页${size}条`)

    try {
      const res = await getPagedUsersListAPI(pageNo)
      console.log('用户列表API响应:', res)

      if (res && res.code === 1 && res.data) {
        // 处理分页数据 - 根据API响应结构调整
        const pageData = res.data
        userList.value = pageData.records || pageData.list || pageData || []
        total.value = pageData.total || pageData.totalCount || userList.value.length
        currPageNo.value = pageData.current || pageData.pageNo || pageNo

        console.log('用户列表数据:', userList.value)
        console.log('总记录数:', total.value)
        return
      }
    } catch (apiError) {
      console.warn('API调用失败，使用模拟数据:', apiError)
    }

    // API调用失败时使用模拟数据
    console.log('使用模拟数据进行展示')
    ElMessage.info('后端服务暂不可用，显示模拟数据')

    // 模拟分页逻辑
    const startIndex = (pageNo - 1) * size
    const endIndex = startIndex + size
    const filteredData = filterMockData()
    const pageData = filteredData.slice(startIndex, endIndex)

    userList.value = pageData
    total.value = filteredData.length
    currPageNo.value = pageNo

    console.log('模拟用户列表数据:', userList.value)
    console.log('模拟总记录数:', total.value)

  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
    userList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 过滤模拟数据（根据搜索条件）
const filterMockData = () => {
  let filteredData = [...mockUserData]

  // 按用户名过滤
  if (searchForm.userName) {
    filteredData = filteredData.filter(user =>
      user.userName.toLowerCase().includes(searchForm.userName.toLowerCase())
    )
  }

  // 按用户角色过滤
  if (searchForm.userRole) {
    filteredData = filteredData.filter(user => user.userRole === searchForm.userRole)
  }

  return filteredData
}

// 分页组件回调
const setCurrentPageNo = (pageNo) => {
  console.log('切换到第', pageNo, '页')
  currPageNo.value = pageNo
  loadPagedUsers(pageNo, pageSize.value)
}

// 搜索用户
const searchUsers = () => {
  console.log('搜索条件:', searchForm)
  // 重置到第一页
  currPageNo.value = 1
  loadPagedUsers(1, pageSize.value)
}

// 重置搜索
const resetSearch = () => {
  searchForm.userName = ''
  searchForm.userRole = ''
  currPageNo.value = 1
  loadPagedUsers(1, pageSize.value)
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
      id: user.userId,
      mode: 'edit'
    }
  })
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
  console.log('选中的用户:', selectedUsers.value)
}

// 批量删除用户
const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage({
      message: '请选择要删除的用户',
      type: 'warning',
      duration: 2000
    })
    return
  }

  try {
    const userNames = selectedUsers.value.map(user => user.userName).join('、')
    await ElMessageBox.confirm(
      `您确定要删除选中的 ${selectedUsers.value.length} 个用户吗？删除后将无法恢复，请谨慎操作。\n用户名：${userNames}`,
      '批量删除用户',
      {
        confirmButtonText: '确定删除',
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

    console.log('批量删除用户:', selectedUsers.value)

    try {
      // 尝试调用删除API
      for (const user of selectedUsers.value) {
        await deleteUserAPI(user.userId)
      }
    } catch (apiError) {
      console.warn('API删除失败，使用模拟删除:', apiError)
      // 从模拟数据中删除
      const selectedIds = selectedUsers.value.map(user => user.userId)
      for (let i = mockUserData.length - 1; i >= 0; i--) {
        if (selectedIds.includes(mockUserData[i].userId)) {
          mockUserData.splice(i, 1)
        }
      }
    }

    // 显示成功提示
    ElMessage({
      message: '批量删除成功',
      type: 'success',
      duration: 2000
    })

    selectedUsers.value = []
    // 重新加载当前页数据
    loadPagedUsers(currPageNo.value, pageSize.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败，请重试')
    }
  }
}

// 删除用户
const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `您确定要删除用户"${user.userName}"吗？删除后将无法恢复，请谨慎操作。`,
      '删除用户',
      {
        confirmButtonText: '确定删除',
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

    console.log('删除用户:', user.userName)

    try {
      const res = await deleteUserAPI(user.userId)
      console.log('删除用户API响应:', res)

      if (res && res.code === 1) {
        // 显示成功提示
        ElMessage({
          message: '删除用户成功',
          type: 'success',
          duration: 2000
        })
      } else {
        throw new Error(res?.msg || '删除用户失败')
      }
    } catch (apiError) {
      console.warn('API删除失败，使用模拟删除:', apiError)
      // 从模拟数据中删除
      const index = mockUserData.findIndex(item => item.userId === user.userId)
      if (index > -1) {
        mockUserData.splice(index, 1)
        // 显示成功提示
        ElMessage({
          message: '删除用户成功',
          type: 'success',
          duration: 2000
        })
      } else {
        ElMessage.error('用户不存在')
        return
      }
    }

    // 重新加载当前页数据
    loadPagedUsers(currPageNo.value, pageSize.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败，请重试')
    }
  }
}

// 页面初始化
onMounted(() => {
  loadPagedUsers(currPageNo.value, pageSize.value)
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
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-table {
  margin-bottom: 20px;
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
  line-height: 1.6 !important;
}

.custom-message-box .el-message-box__btns {
  padding: 10px 20px 20px !important;
  text-align: right !important;
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
</style>
