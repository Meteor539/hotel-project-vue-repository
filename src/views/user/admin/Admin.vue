<template>
  <div class="user-admin">
    <div class="wrapper">
      <div class="title">用户管理统计</div>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-row :gutter="20">
          <el-col :span="6" v-for="stat in statsData" :key="stat.type">
            <el-card class="stat-card" :class="stat.className">
              <div class="card-content">
                <div class="stat-icon">
                  <el-icon :size="40" :color="stat.iconColor">
                    <component :is="stat.icon" />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">{{ stat.count }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <div class="section-title">快捷操作</div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-button type="primary" size="large" @click="goToUserList" style="width: 100%">
              <el-icon><List /></el-icon>
              用户列表管理
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="success" size="large" @click="goToAddUser" style="width: 100%">
              <el-icon><Plus /></el-icon>
              新增用户
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="info" size="large" @click="refreshStats" style="width: 100%">
              <el-icon><Refresh /></el-icon>
              刷新统计
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 最近操作记录 -->
      <div class="recent-actions">
        <div class="section-title">系统说明</div>
        <el-card>
          <div class="info-content">
            <p><strong>用户管理功能说明：</strong></p>
            <ul>
              <li>支持用户的增删改查操作</li>
              <li>支持按用户名和角色进行搜索</li>
              <li>支持批量删除用户</li>
              <li>用户角色包括：管理员、经理、普通用户</li>
              <li>删除操作需要确认，确保数据安全</li>
            </ul>
            <p><strong>注意事项：</strong></p>
            <ul>
              <li>用户名创建后不可修改</li>
              <li>密码修改时需要重新输入确认</li>
              <li>删除用户操作不可恢复，请谨慎操作</li>
            </ul>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, UserFilled, Avatar, Setting, List, Plus, Refresh } from '@element-plus/icons-vue'
import { getPagedUsersListAPI } from '@/apis/authAPI'

const router = useRouter()

// 统计数据
const statsData = ref([
  {
    type: 'total',
    label: '总用户数',
    count: 0,
    icon: User,
    iconColor: '#409eff',
    className: 'total-users'
  },
  {
    type: 'admin',
    label: '管理员',
    count: 0,
    icon: UserFilled,
    iconColor: '#f56c6c',
    className: 'admin-users'
  },
  {
    type: 'manager',
    label: '经理',
    count: 0,
    icon: Avatar,
    iconColor: '#e6a23c',
    className: 'manager-users'
  },
  {
    type: 'user',
    label: '普通用户',
    count: 0,
    icon: Setting,
    iconColor: '#67c23a',
    className: 'normal-users'
  }
])



// 加载统计数据
const loadStats = async () => {
  try {
    // 由于AuthAPI只支持分页查询，我们获取前几页数据进行统计
    const pagePromises = []
    for (let page = 1; page <= 5; page++) { // 获取前5页数据
      pagePromises.push(getPagedUsersListAPI(page))
    }

    const pageResults = await Promise.all(pagePromises)
    console.log('用户统计API响应:', pageResults)

    // 合并所有页的数据
    const allUsers = []
    pageResults.forEach(pageRes => {
      if (pageRes && pageRes.code === 1 && pageRes.data) {
        const records = pageRes.data.records || pageRes.data.list || pageRes.data || []
        if (Array.isArray(records)) {
          allUsers.push(...records)
        }
      }
    })

    // 去重处理（因为可能从多页获取到重复数据）
    const uniqueUsers = []
    const seenIds = new Set()

    allUsers.forEach(user => {
      const userId = user.userId || user.user_id
      if (userId && !seenIds.has(userId)) {
        seenIds.add(userId)
        uniqueUsers.push(user)
      }
    })

    if (uniqueUsers.length > 0) {
      // 统计各类用户数量
      const totalCount = uniqueUsers.length
      const adminCount = uniqueUsers.filter(user => user.userRole === 'admin').length
      const managerCount = uniqueUsers.filter(user => user.userRole === 'manager').length
      const userCount = uniqueUsers.filter(user => user.userRole === 'user').length

      // 更新统计数据
      statsData.value[0].count = totalCount
      statsData.value[1].count = adminCount
      statsData.value[2].count = managerCount
      statsData.value[3].count = userCount

      console.log('用户统计:', { totalCount, adminCount, managerCount, userCount })
    } else {
      throw new Error('未获取到用户数据')
    }
  } catch (error) {
    console.error('加载用户统计失败:', error)
    ElMessage.error('加载用户统计失败')
    // 使用默认值
    statsData.value.forEach(stat => stat.count = 0)
  }
}

// 跳转到用户列表
const goToUserList = () => {
  router.push('/user/list')
}

// 跳转到新增用户
const goToAddUser = () => {
  router.push('/user/add')
}

// 刷新统计
const refreshStats = async () => {
  ElMessage.info('正在刷新统计数据...')
  await loadStats()
  ElMessage.success('统计数据刷新完成')
}

// 页面初始化
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.user-admin {
  margin: 10px;
}

.wrapper {
  padding: 10px;
  margin: 10px;
  background-color: #fff;
}

.title {
  background-color: #f6f6f6;
  height: 50px;
  line-height: 50px;
  font-weight: bold;
  padding-left: 10px;
  margin-bottom: 20px;
}

.stats-cards {
  margin-bottom: 30px;
}

.stat-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.quick-actions, .recent-actions {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.info-content {
  line-height: 1.6;
  color: #606266;
}

.info-content p {
  margin-bottom: 10px;
}

.info-content ul {
  margin: 10px 0;
  padding-left: 20px;
}

.info-content li {
  margin-bottom: 5px;
}

/* 不同类型卡片的样式 */
.total-users {
  border-left: 4px solid #409eff;
}

.admin-users {
  border-left: 4px solid #f56c6c;
}

.manager-users {
  border-left: 4px solid #e6a23c;
}

.normal-users {
  border-left: 4px solid #67c23a;
}
</style>
