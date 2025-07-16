<template>
  <div class="room-status">
    <div class="wrapper">
      <div class="title">房间状态统计</div>

      <!-- 状态统计卡片 -->
      <div class="status-cards">
        <el-row :gutter="20">
          <el-col :span="4" v-for="status in statusList" :key="status.value">
            <el-card
              class="status-card"
              :class="status.className"
              @click="handleStatusClick(status.value)"
              style="cursor: pointer;"
            >
              <div class="card-content">
                <div class="status-name">{{ status.label }}</div>
                <div class="status-count">{{ status.count }}</div>
                <div class="status-icon">
                  <el-tag :type="status.tagType" size="small">{{ status.label }}</el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 选中状态的房间列表 -->
      <div class="room-list-section" v-if="selectedStatus">
        <div class="section-title">
          {{ getStatusLabel(selectedStatus) }} 房间列表
          <el-button type="text" @click="clearSelection">清除选择</el-button>
        </div>

        <el-table
          :data="filteredRoomList"
          style="width: 100%"
          v-loading="loading"
          border
          stripe
        >
          <el-table-column prop="roomNumber" label="房间号" width="100" />
          <el-table-column prop="branchName" label="所属分店" width="150" />
          <el-table-column prop="roomType" label="房间类型" width="120" />
          <el-table-column prop="facilities" label="房间设施" min-width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="房间状态" width="120">
            <template #default="scope">
              <el-tag
                :type="getStatusTagType(scope.row.status)"
                size="small"
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
          <!-- <el-table-column prop="createTime" label="创建时间" width="180" /> -->
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getRoomsByStatusAPI,
  getPagedRoomsListAPI
} from '@/apis/roomAPI'
import { getAllBranchesAPI } from '@/apis/branchAPI'

// 状态列表配置
const statusList = ref([
  {
    value: '未入住',
    label: '未入住',
    count: 0,
    tagType: 'success',
    className: 'available-card'
  },
  {
    value: '有住客',
    label: '有住客',
    count: 0,
    tagType: 'warning',
    className: 'occupied-card'
  },
  {
    value: '已预订',
    label: '已预订',
    count: 0,
    tagType: 'primary',
    className: 'reserved-card'
  },
  {
    value: '保洁中',
    label: '保洁中',
    count: 0,
    tagType: 'info',
    className: 'cleaning-card'
  },
  {
    value: '已退房未保洁',
    label: '已退房未保洁',
    count: 0,
    tagType: 'warning',
    className: 'checkout-card'
  },
  {
    value: '维修中',
    label: '维修中',
    count: 0,
    tagType: 'danger',
    className: 'maintenance-card'
  }
])

// 数据状态
const loading = ref(false)
const selectedStatus = ref('')
const filteredRoomList = ref([])
const allRoomData = ref({}) // 缓存各状态的房间数据
const branchList = ref([]) // 分店列表

// 获取状态标签类型
const getStatusTagType = (status) => {
  const statusConfig = statusList.value.find(s => s.value === status)
  return statusConfig ? statusConfig.tagType : ''
}

// 获取状态标签
const getStatusLabel = (status) => {
  const statusConfig = statusList.value.find(s => s.value === status)
  return statusConfig ? statusConfig.label : status
}

// 点击状态卡片
const handleStatusClick = async (status) => {
  selectedStatus.value = status
  await loadRoomsByStatus(status)
}

// 清除选择
const clearSelection = () => {
  selectedStatus.value = ''
  filteredRoomList.value = []
}

// 根据状态加载房间列表
const loadRoomsByStatus = async (status) => {
  try {
    loading.value = true

    // 检查缓存
    if (allRoomData.value[status]) {
      filteredRoomList.value = allRoomData.value[status]
      return
    }

    const res = await getRoomsByStatusAPI(status)

    if (res && res.data) {
      const rooms = Array.isArray(res.data) ? res.data : []
      const formattedRooms = rooms.map(formatRoomData)

      // 缓存数据
      allRoomData.value[status] = formattedRooms
      filteredRoomList.value = formattedRooms
    } else {
      ElMessage.error('获取房间状态数据失败')
      filteredRoomList.value = []
    }
  } catch (error) {
    console.error('加载房间状态数据失败:', error)
    ElMessage.error('加载房间状态数据失败')
    filteredRoomList.value = []
  } finally {
    loading.value = false
  }
}

// 根据分店ID获取分店名称
const getBranchNameById = (branchId) => {
  if (!branchId || !branchList.value.length) return null;
  const branch = branchList.value.find(b => b.id == branchId);
  return branch ? branch.name : null;
}

// 格式化房间数据
const formatRoomData = (room) => {
  return {
    id: room.id || room.roomId || room.room_id,
    roomNumber: room.roomNumber || room.roomNo || room.room_no || '',
    branchName: getBranchNameById(room.branchId || room.branch_id) || room.branchName || room.branch_name || '未知分店',
    roomType: room.roomType || room.room_type || '',
    facilities: room.facilities || room.roomFacilities || room.room_facilities || '',
    status: room.status || room.roomStatus || room.room_status || '未入住',
    remark: room.remark || room.roomRemark || room.room_remark || '',
    createTime: formatDateTime(room.createTime || room.createdTime || room.createDate || room.create_time)
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '暂无数据'

  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return '暂无数据'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 加载所有状态统计
const loadStatusStatistics = async () => {
  try {
    loading.value = true

    // 并发请求所有状态的数据
    const promises = statusList.value.map(async (status) => {
      try {
        const res = await getRoomsByStatusAPI(status.value)
        const count = res && res.data ? (Array.isArray(res.data) ? res.data.length : 0) : 0

        // 缓存数据
        if (res && res.data && Array.isArray(res.data)) {
          allRoomData.value[status.value] = res.data.map(formatRoomData)
        }

        return { status: status.value, count }
      } catch (error) {
        console.error(`获取${status.label}状态数据失败:`, error)
        return { status: status.value, count: 0 }
      }
    })

    const results = await Promise.all(promises)

    // 更新统计数据
    results.forEach(result => {
      const statusItem = statusList.value.find(s => s.value === result.status)
      if (statusItem) {
        statusItem.count = result.count
      }
    })

  } catch (error) {
    console.error('加载状态统计失败:', error)
    ElMessage.error('加载状态统计失败')
  } finally {
    loading.value = false
  }
}

// 加载分店列表
const loadBranches = async () => {
  try {
    const res = await getAllBranchesAPI()
    let branches = []

    if (res && res.code === 1 && res.data) {
      branches = res.data.records || res.data.list || res.data || []
    } else if (res && res.code === 200 && res.data) {
      branches = res.data.records || res.data.list || res.data || []
    } else if (res && Array.isArray(res)) {
      branches = res
    } else if (res && res.data && Array.isArray(res.data)) {
      branches = res.data
    }

    branchList.value = branches.map(branch => ({
      id: branch.id || branch.branchId || branch.branch_id,
      name: branch.name || branch.branchName || branch.branch_name || `分店${branch.id || '未知'}`
    }))
  } catch (error) {
    console.error('加载分店列表失败:', error)
    branchList.value = []
  }
}

// 页面初始化
onMounted(async () => {
  console.log('房间状态页面 onMounted')
  // 先加载分店数据，再加载状态统计
  await loadBranches()
  loadStatusStatistics()
})

// 页面重新激活时刷新数据（从其他页面返回时）
onActivated(async () => {
  console.log('房间状态页面 onActivated')
  // 先加载分店数据，再加载状态统计
  await loadBranches()
  loadStatusStatistics()
})
</script>

<style scoped>
.room-status {
  padding: 20px;
}

.wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.status-cards {
  margin-bottom: 30px;
}

.status-card {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  text-align: center;
  padding: 10px;
}

.status-name {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.status-count {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.status-icon {
  display: flex;
  justify-content: center;
}

/* 不同状态卡片的颜色主题 */
.available-card {
  border-left: 4px solid #67c23a;
}

.occupied-card {
  border-left: 4px solid #e6a23c;
}

.reserved-card {
  border-left: 4px solid #409eff;
}

.cleaning-card {
  border-left: 4px solid #909399;
}

.checkout-card {
  border-left: 4px solid #f56c6c;
}

.maintenance-card {
  border-left: 4px solid #f56c6c;
}

.room-list-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .wrapper {
    max-width: 100%;
    padding: 0 10px;
  }
}

@media (max-width: 768px) {
  .status-cards .el-col {
    margin-bottom: 15px;
  }

  .card-content {
    padding: 15px 10px;
  }

  .status-count {
    font-size: 24px;
  }
}
</style>
