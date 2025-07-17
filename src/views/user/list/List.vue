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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, Delete, Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getPagedUsersListAPI, deleteUserAPI } from '@/apis/authAPI'
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

// 搜索相关数据
const allUsersData = ref([]) // 存储所有用户数据用于搜索过滤
const isSearchMode = ref(false) // 标识当前是否在搜索模式

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    'admin': '管理员',
    'manager': '经理',
    'user': '普通用户'
  }
  return roleMap[role] || role
}





// 加载分页用户列表
const loadPagedUsers = async (pageNo = 1, size = 8) => {
  try {
    loading.value = true
    console.log(`正在加载第${pageNo}页用户数据，每页${size}条`)

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
    } else {
      throw new Error(res?.msg || '获取用户列表失败')
    }

  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
    userList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}



// 分页组件回调
const setCurrentPageNo = (pageNo) => {
  console.log('切换到第', pageNo, '页')
  currPageNo.value = pageNo

  if (isSearchMode.value) {
    // 搜索模式下，重新执行搜索以获取对应页的数据
    loadUsersWithSearch()
  } else {
    // 正常模式下，加载对应页的数据
    loadPagedUsers(pageNo, pageSize.value)
  }
}

// 搜索用户
const searchUsers = async () => {
  console.log('搜索条件:', searchForm)

  // 检查是否有搜索条件
  const hasSearchCondition = searchForm.userName.trim() || searchForm.userRole

  if (!hasSearchCondition) {
    // 没有搜索条件，回到正常分页模式
    isSearchMode.value = false
    currPageNo.value = 1
    loadPagedUsers(1, pageSize.value)
    return
  }

  // 有搜索条件，进入搜索模式
  isSearchMode.value = true
  currPageNo.value = 1
  await loadUsersWithSearch()
}

// 重置搜索
const resetSearch = () => {
  searchForm.userName = ''
  searchForm.userRole = ''
  isSearchMode.value = false
  currPageNo.value = 1
  loadPagedUsers(1, pageSize.value)
}

// 带搜索条件的用户加载
const loadUsersWithSearch = async () => {
  try {
    loading.value = true
    console.log('执行搜索，条件:', searchForm)

    // 由于AuthAPI只支持分页查询，我们获取前几页数据进行搜索
    const pagePromises = []
    for (let page = 1; page <= 5; page++) { // 获取前5页数据
      pagePromises.push(getPagedUsersListAPI(page))
    }

    const pageResults = await Promise.all(pagePromises)
    console.log('搜索用户API响应:', pageResults)

    // 合并所有页的数据
    const allRecords = []
    pageResults.forEach(pageRes => {
      if (pageRes && pageRes.code === 1 && pageRes.data) {
        const records = pageRes.data.records || pageRes.data.list || pageRes.data || []
        if (Array.isArray(records)) {
          allRecords.push(...records)
        }
      }
    })

    // 构造统一的响应格式
    const res = {
      data: allRecords
    }

    if (allRecords.length > 0) {
      // 处理搜索结果数据
      handleSearchResultData(res)
    } else {
      throw new Error('未获取到用户数据')
    }

  } catch (error) {
    console.error('搜索用户失败:', error)
    ElMessage.error('搜索用户失败')
    userList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理搜索结果数据
const handleSearchResultData = (res) => {
  const records = Array.isArray(res.data) ? res.data : []

  if (records.length > 0) {
    // 去重处理（因为可能从多页获取到重复数据）
    const uniqueRecords = []
    const seenIds = new Set()

    records.forEach(user => {
      const userId = user.userId || user.user_id
      if (userId && !seenIds.has(userId)) {
        seenIds.add(userId)
        uniqueRecords.push(user)
      }
    })

    // 存储所有数据
    allUsersData.value = uniqueRecords

    // 应用前端过滤
    let filteredRecords = uniqueRecords.filter(user => {
      let match = true

      // 用户名过滤（模糊匹配）
      if (searchForm.userName && searchForm.userName.trim()) {
        const userName = user.userName || user.user_name || ''
        match = match && userName.toLowerCase().includes(searchForm.userName.toLowerCase())
      }

      // 用户角色过滤（精确匹配）
      if (searchForm.userRole && searchForm.userRole.trim()) {
        const userRole = user.userRole || user.user_role || ''
        match = match && (userRole === searchForm.userRole)
      }

      return match
    })

    // 前端分页处理
    const startIndex = (currPageNo.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

    userList.value = paginatedRecords
    total.value = filteredRecords.length

    console.log('搜索结果:', {
      total: filteredRecords.length,
      currentPage: paginatedRecords.length,
      searchConditions: searchForm
    })

    // 搜索结果提示
    if (filteredRecords.length === 0) {
      ElMessage.info('未找到符合条件的用户')
    } else {
      ElMessage.success(`找到 ${filteredRecords.length} 个符合条件的用户`)
    }
  } else {
    userList.value = []
    total.value = 0
    ElMessage.info('未找到符合条件的用户')
  }
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

    // 调用删除API
    for (const user of selectedUsers.value) {
      await deleteUserAPI(user.userId)
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
