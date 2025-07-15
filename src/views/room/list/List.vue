<template>
  <div class="room">
    <div class="wrapper">
      <div class="title">房间信息管理</div>
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="房间号">
            <el-input v-model="searchForm.roomNumber" placeholder="房间号" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="所属分店">
            <el-select v-model="searchForm.branchId" placeholder="请选择分店" clearable style="width: 200px">
              <el-option
                v-for="branch in branchList"
                :key="branch.id"
                :label="branch.name"
                :value="branch.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="房间类型">
            <el-select v-model="searchForm.roomType" placeholder="请选择类型" clearable style="width: 200px">
              <el-option label="标准间" value="标准间" />
              <el-option label="大床房" value="大床房" />
              <el-option label="豪华间" value="豪华间" />
              <el-option label="套房" value="套房" />
              <el-option label="总统套房" value="总统套房" />
            </el-select>
          </el-form-item>
          <el-form-item label="房间状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="可用" value="可用" />
              <el-option label="已入住" value="已入住" />
              <el-option label="维修中" value="维修中" />
              <el-option label="清洁中" value="清洁中" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜 索</el-button>
            <el-button @click="handleReset">重 置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="warning" :icon="Plus" @click="handleAdd">新增房间</el-button>
        <el-button type="danger" :icon="Delete" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <!-- <div class="operation-buttons">
        <el-button type="warning" :icon="Plus" @click="handleAdd">新增房间</el-button>
        <el-button type="danger" :icon="Delete" @click="handleBatchDelete">批量删除</el-button>
      </div> -->

      <!-- 房间列表表格 -->
      <el-table
        :data="roomList"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        border
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="编号" width="60" />
        <el-table-column prop="roomNumber" label="房间号" width="80" />
        <el-table-column prop="branchName" label="所属分店" width="150" />
        <el-table-column prop="roomType" label="房间类型" width="120" />
        <el-table-column prop="price" label="房间价格" width="120">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
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
        <el-table-column prop="description" label="房间描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" :icon="EditPen" @click="handleEdit(scope.row)">修 改</el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(scope.row)">删 除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
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
import { getPagedRoomsListAPI, deleteRoomAPI } from '@/apis/roomAPI'
import { getAllBranchesAPI } from '@/apis/branchAPI'
import Page from '@/components/Page.vue'

// 路由实例
const router = useRouter()

// 搜索表单数据
const searchForm = reactive({
  roomNumber: '',
  branchId: null,
  roomType: '',
  status: ''
})

// 分店列表
const branchList = ref([])

// 删除了对话框相关的变量，因为改为跳转到add页面

// 数据列表
const roomList = ref([])
const total = ref(0)
const currPageNo = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 多选相关
const multipleSelection = ref([])

// 搜索功能
const handleSearch = () => {
  currPageNo.value = 1
  loadPagedRooms(currPageNo.value, pageSize.value)
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    roomNumber: '',
    branchId: null,
    roomType: '',
    status: ''
  })
  currPageNo.value = 1
  loadPagedRooms(currPageNo.value, pageSize.value)
}

// 新增房间 - 跳转到add页面
const handleAdd = () => {
  router.push('/room/add')
}

// 编辑房间 - 跳转到add页面并传递编辑数据
const handleEdit = (row) => {
  router.push({
    path: '/room/add',
    query: {
      id: row.id,
      mode: 'edit'
    }
  })
}

// 删除房间
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除房间 "${row.roomNumber}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteRoomAPI(row.id)
    ElMessage.success('删除成功')
    loadPagedRooms(currPageNo.value, pageSize.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的房间')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 个房间吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 批量删除逻辑
    for (const room of multipleSelection.value) {
      await deleteRoomAPI(room.id)
    }

    ElMessage.success('批量删除成功')
    loadPagedRooms(currPageNo.value, pageSize.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 多选处理
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case '可用':
      return 'success'
    case '已入住':
      return 'warning'
    case '维修中':
      return 'danger'
    case '清洁中':
      return 'info'
    default:
      return ''
  }
}

// 分页页码改变
const setCurrentPageNo = (pageNo) => {
  currPageNo.value = pageNo
  loadPagedRooms(currPageNo.value, pageSize.value)
}

// 加载分页房间数据
const loadPagedRooms = async (pageNo, size) => {
  loading.value = true
  try {
    // 暂时使用模拟数据进行测试
    const mockData = [
      {
        id: 1,
        roomNumber: '101',
        branchName: '北京总店',
        roomType: '标准间',
        price: 288.00,
        status: '可用',
        description: '舒适的标准间，配备独立卫浴和空调',
        createTime: '2024-01-15 10:30:00'
      },
      {
        id: 2,
        roomNumber: '102',
        branchName: '北京总店',
        roomType: '大床房',
        price: 368.00,
        status: '已入住',
        description: '宽敞的大床房，适合商务出行',
        createTime: '2024-01-15 10:35:00'
      },
      {
        id: 3,
        roomNumber: '201',
        branchName: '上海分店',
        roomType: '豪华间',
        price: 588.00,
        status: '清洁中',
        description: '豪华装修，享受高品质住宿体验',
        createTime: '2024-01-15 11:00:00'
      },
      {
        id: 4,
        roomNumber: '202',
        branchName: '上海分店',
        roomType: '套房',
        price: 888.00,
        status: '可用',
        description: '宽敞套房，包含客厅和卧室',
        createTime: '2024-01-15 11:15:00'
      },
      {
        id: 5,
        roomNumber: '301',
        branchName: '广州分店',
        roomType: '总统套房',
        price: 1588.00,
        status: '维修中',
        description: '顶级总统套房，奢华享受',
        createTime: '2024-01-15 11:30:00'
      },
      {
        id: 6,
        roomNumber: '302',
        branchName: '广州分店',
        roomType: '标准间',
        price: 268.00,
        status: '可用',
        description: '经济实惠的标准间',
        createTime: '2024-01-15 11:45:00'
      },
      {
        id: 7,
        roomNumber: '401',
        branchName: '深圳分店',
        roomType: '大床房',
        price: 398.00,
        status: '已入住',
        description: '现代化大床房，设施齐全',
        createTime: '2024-01-15 12:00:00'
      },
      {
        id: 8,
        roomNumber: '402',
        branchName: '深圳分店',
        roomType: '豪华间',
        price: 628.00,
        status: '可用',
        description: '海景豪华间，视野开阔',
        createTime: '2024-01-15 12:15:00'
      }
    ]

    // 模拟分页
    const startIndex = (pageNo - 1) * size
    const endIndex = startIndex + size
    const pagedData = mockData.slice(startIndex, endIndex)

    roomList.value = pagedData
    total.value = mockData.length

    // 注释掉真实API调用，等后端接口准备好后再启用
    /*
    const params = {
      pageNo,
      pageSize: size,
      ...searchForm
    }

    const res = await getPagedRoomsListAPI(params.pageNo, params.pageSize)
    if (res.data.code === 200) {
      roomList.value = res.data.data.records || []
      total.value = res.data.data.total || 0
    } else {
      ElMessage.error('加载房间列表失败')
    }
    */
  } catch (error) {
    console.error('加载房间列表失败:', error)
    ElMessage.error('加载房间列表失败')
  } finally {
    loading.value = false
  }
}

// 加载分店列表
const loadBranches = async () => {
  try {
    // 暂时使用模拟数据
    branchList.value = [
      { id: 1, name: '北京总店' },
      { id: 2, name: '上海分店' },
      { id: 3, name: '广州分店' },
      { id: 4, name: '深圳分店' },
      { id: 5, name: '杭州分店' }
    ]

    // 注释掉真实API调用
    /*
    const res = await getAllBranchesAPI()
    if (res.data.code === 200) {
      branchList.value = res.data.data || []
    }
    */
  } catch (error) {
    console.error('加载分店列表失败:', error)
  }
}

// 页面初始化
onMounted(() => {
  loadBranches()
  loadPagedRooms(currPageNo.value, pageSize.value)
})
</script>

<style scoped>
.room {
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
