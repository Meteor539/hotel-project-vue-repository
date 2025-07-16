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
              <el-option label="普单人间" value="普单人间" />
              <el-option label="普双人间" value="普双人间" />
              <el-option label="三人间" value="三人间" />
              <el-option label="商务套房" value="商务套房" />
              <el-option label="贵宾套房" value="贵宾套房" />
            </el-select>
          </el-form-item>
          <el-form-item label="房间状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="未入住" value="未入住" />
              <el-option label="有住客" value="有住客" />
              <el-option label="已预订" value="已预订" />
              <el-option label="保洁中" value="保洁中" />
              <el-option label="已退房未保洁" value="已退房未保洁" />
              <el-option label="维修中" value="维修中" />
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
        <el-table-column prop="roomNumber" label="房间号" width="70" />
        <el-table-column prop="branchName" label="所属分店" width="150" />
        <el-table-column prop="roomType" label="房间类型" width="100" />
        <el-table-column prop="facilities" label="房间设施" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.facilities || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="房间状态" width="100">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.status)"
              size="small"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注说明" min-width="200" show-overflow-tooltip />
        <!-- <el-table-column prop="createTime" label="创建时间" width="180" /> -->
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
import { ref, reactive, onMounted, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, Delete, Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import {
  getPagedRoomsListAPI,
  deleteRoomAPI,
  getRoomsByTypeAPI,
  getRoomsByStatusAPI,
  getRoomsByBranchNameAPI,
  getRoomsByBranchIdAPI
} from '@/apis/roomAPI'
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
  loadRoomsWithSearch()
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
      id: row.roomId || row.id,
      mode: 'edit'
    }
  })
}

// 删除房间
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `您确定要删除房间"${row.roomNumber}"吗？删除后将无法恢复，请谨慎操作。`,
      '删除房间',
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

    await deleteRoomAPI(row.id)

    // 显示成功提示
    ElMessage({
      message: '删除房间成功',
      type: 'success',
      duration: 2000,
      showClose: true
    })

    // 刷新数据
    if (hasSearchConditions()) {
      loadRoomsWithSearch()
    } else {
      loadPagedRooms(currPageNo.value, pageSize.value)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      // 显示错误提示
      ElMessage({
        message: '删除房间失败，请重试',
        type: 'error',
        duration: 3000,
        showClose: true
      })
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage({
      message: '请选择要删除的房间',
      type: 'warning',
      duration: 2000,
      showClose: true
    })
    return
  }

  try {
    await ElMessageBox.confirm(
      `您确定要删除选中的 ${multipleSelection.value.length} 个房间吗？删除后将无法恢复，请谨慎操作。`,
      '批量删除房间',
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

    // 批量删除逻辑
    for (const room of multipleSelection.value) {
      await deleteRoomAPI(room.id)
    }

    // 显示成功提示
    ElMessage({
      message: '批量删除成功',
      type: 'success',
      duration: 2000,
      showClose: true
    })

    // 刷新数据
    if (hasSearchConditions()) {
      loadRoomsWithSearch()
    } else {
      loadPagedRooms(currPageNo.value, pageSize.value)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      // 显示错误提示
      ElMessage({
        message: '批量删除失败，请重试',
        type: 'error',
        duration: 3000,
        showClose: true
      })
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
    case '未入住':
      return 'success'
    case '有住客':
      return 'warning'
    case '已预订':
      return 'primary'
    case '保洁中':
      return 'info'
    case '已退房未保洁':
      return 'warning'
    case '维修中':
      return 'danger'
    default:
      return ''
  }
}

// 分页页码改变
const setCurrentPageNo = (pageNo) => {
  currPageNo.value = pageNo
  // 检查是否有搜索条件，如果有则使用搜索，否则使用普通分页
  if (hasSearchConditions()) {
    loadRoomsWithSearch()
  } else {
    loadPagedRooms(currPageNo.value, pageSize.value)
  }
}

// 检查是否有搜索条件
const hasSearchConditions = () => {
  return searchForm.roomNumber ||
         searchForm.branchId ||
         searchForm.roomType ||
         searchForm.status
}

// 根据搜索条件加载房间数据
const loadRoomsWithSearch = async () => {
  try {
    loading.value = true;
    let res = null;

    console.log('开始搜索，条件:', searchForm);

    // 智能选择API策略：优先使用最具体的单一条件API
    if (searchForm.roomType && !searchForm.branchId && !searchForm.status && !searchForm.roomNumber) {
      // 仅按房间类型搜索
      console.log('使用房间类型API');
      res = await getRoomsByTypeAPI(searchForm.roomType);
    } else if (searchForm.status && !searchForm.branchId && !searchForm.roomType && !searchForm.roomNumber) {
      // 仅按房间状态搜索
      console.log('使用房间状态API');
      res = await getRoomsByStatusAPI(searchForm.status);
    } else if (searchForm.branchId && !searchForm.roomType && !searchForm.status && !searchForm.roomNumber) {
      // 仅按分店ID搜索
      console.log('使用分店ID API');
      res = await getRoomsByBranchIdAPI(searchForm.branchId);
    } else if (searchForm.roomType && searchForm.status && !searchForm.branchId && !searchForm.roomNumber) {
      // 房间类型 + 房间状态：优先用状态API，然后过滤类型
      console.log('使用房间状态API + 类型过滤');
      res = await getRoomsByStatusAPI(searchForm.status);
    } else if (searchForm.branchId && searchForm.roomType && !searchForm.status && !searchForm.roomNumber) {
      // 分店ID + 房间类型：优先用分店API，然后过滤类型
      console.log('使用分店ID API + 类型过滤');
      res = await getRoomsByBranchIdAPI(searchForm.branchId);
    } else if (searchForm.branchId && searchForm.status && !searchForm.roomType && !searchForm.roomNumber) {
      // 分店ID + 房间状态：优先用分店API，然后过滤状态
      console.log('使用分店ID API + 状态过滤');
      res = await getRoomsByBranchIdAPI(searchForm.branchId);
    } else {
      // 复合搜索条件或包含房间号搜索
      // 对于复合条件，我们需要获取更多数据来进行前端过滤
      console.log('复合搜索条件，使用扩展数据获取策略');

      // 优先选择一个能返回较多数据的单一API，然后在前端过滤其他条件
      if (searchForm.branchId) {
        // 如果有分店条件，优先使用分店API（通常分店内房间数量相对较少）
        console.log('使用分店ID API + 多条件前端过滤');
        res = await getRoomsByBranchIdAPI(searchForm.branchId);
      } else if (searchForm.status) {
        // 如果有状态条件，使用状态API
        console.log('使用房间状态API + 多条件前端过滤');
        res = await getRoomsByStatusAPI(searchForm.status);
      } else if (searchForm.roomType) {
        // 如果有类型条件，使用类型API
        console.log('使用房间类型API + 多条件前端过滤');
        res = await getRoomsByTypeAPI(searchForm.roomType);
      } else {
        // 如果只有房间号条件，使用分页API获取更多页数据
        console.log('使用扩展分页API + 前端过滤');
        // 获取前几页的数据以增加找到匹配房间的概率
        const pagePromises = [];
        for (let page = 1; page <= 5; page++) { // 获取前5页数据
          pagePromises.push(getPagedRoomsListAPI(page));
        }
        const pageResults = await Promise.all(pagePromises);

        // 合并所有页的数据
        const allRecords = [];
        pageResults.forEach(pageRes => {
          if (pageRes && pageRes.data && pageRes.data.records) {
            allRecords.push(...pageRes.data.records);
          }
        });

        // 构造统一的响应格式
        res = {
          data: allRecords
        };
      }
    }

    if (res && res.data) {
      // 处理搜索结果数据
      console.log('搜索API返回数据:', res);
      handleSearchResultData(res);
    } else {
      console.error('搜索API返回数据异常:', res);
      ElMessage.error('搜索房间列表失败')
    }

  } catch (error) {
    console.error('搜索房间数据失败:', error);
    ElMessage.error('搜索房间数据失败')
  } finally {
    loading.value = false;
  }
}

// 处理搜索结果数据
const handleSearchResultData = (res) => {
  // 处理不同API返回的数据结构
  let records = [];

  // 检查数据结构，兼容分页API和搜索API的不同返回格式
  if (res.data) {
    if (Array.isArray(res.data)) {
      // 搜索API直接返回数组
      records = res.data;
    } else if (res.data.records) {
      // 分页API返回 { data: { records: [...] } }
      records = res.data.records;
    } else if (res.data.list) {
      // 其他可能的结构 { data: { list: [...] } }
      records = res.data.list;
    }
  }

  console.log('搜索原始数据:', records);
  console.log('当前搜索条件:', searchForm);

  if (Array.isArray(records)) {
    // 应用前端过滤
    let filteredRecords = records.filter(room => {
      let match = true;

      // 房间号过滤（模糊匹配）
      if (searchForm.roomNumber && searchForm.roomNumber.trim()) {
        const roomNo = room.roomNo || room.roomNumber || '';
        match = match && roomNo.toLowerCase().includes(searchForm.roomNumber.toLowerCase());
        console.log(`房间号过滤: ${roomNo} 包含 ${searchForm.roomNumber} = ${match}`);
      }

      // 分店ID过滤
      if (searchForm.branchId) {
        const roomBranchId = room.branchId || room.branch_id;
        match = match && (roomBranchId == searchForm.branchId);
        console.log(`分店ID过滤: ${roomBranchId} == ${searchForm.branchId} = ${match}`);
      }

      // 房间类型过滤
      if (searchForm.roomType && searchForm.roomType.trim()) {
        const roomType = room.roomType || room.room_type;
        match = match && (roomType === searchForm.roomType);
        console.log(`房间类型过滤: ${roomType} == ${searchForm.roomType} = ${match}`);
      }

      // 房间状态过滤
      if (searchForm.status && searchForm.status.trim()) {
        const roomStatus = room.roomStatus || room.status || room.room_status;
        match = match && (roomStatus === searchForm.status);
        console.log(`房间状态过滤: ${roomStatus} == ${searchForm.status} = ${match}`);
      }

      if (match) {
        console.log('匹配的房间:', room);
      }

      return match;
    });

    console.log('过滤后的数据:', filteredRecords);

    // 前端分页处理
    const startIndex = (currPageNo.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // 格式化数据
    const formattedRecords = paginatedRecords.map(formatRoomData);

    console.log('最终显示的数据:', formattedRecords);

    roomList.value = formattedRecords;
    total.value = filteredRecords.length;
  } else {
    roomList.value = [];
    total.value = 0;
  }
}

// 加载分页房间数据
const loadPagedRooms = async (pageNo, size = pageSize.value) => {
  try {
    loading.value = true;

    let res = await getPagedRoomsListAPI(pageNo);

    if (res && res.data) {
      // 处理真实API数据
      handleRealApiData(res, size);
    } else {
      ElMessage.error('获取房间列表失败')
    }

  } catch (error) {
    console.error('加载房间数据失败:', error);
    ElMessage.error('加载房间数据失败')
  } finally {
    loading.value = false;
  }
}

// 格式化房间数据的通用函数
const formatRoomData = (room) => {
  // 创建一个新对象，确保字段名称正确
  const formattedRoom = {
    id: room.id || room.roomId || room.room_id,
    roomNumber: room.roomNumber || room.roomNo || room.room_no || '',
    branchName: getBranchNameById(room.branchId || room.branch_id) || room.branchName || room.branch_name || '未知分店',
    roomType: room.roomType || room.room_type || '',
    facilities: room.facilities || room.roomFacilities || room.room_facilities || '',
    status: room.status || room.roomStatus || room.room_status || '未入住',
    remark: room.remark || room.roomRemark || room.room_remark || '',
    createTime: room.createTime || room.createdTime || room.createDate || room.create_time
  };

  // 格式化日期时间
  if (formattedRoom.createTime) {
    const date = new Date(formattedRoom.createTime);
    // 检查日期是否有效
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      formattedRoom.createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } else {
      formattedRoom.createTime = formattedRoom.createTime || '暂无数据';
    }
  } else {
    formattedRoom.createTime = '暂无数据';
  }

  return formattedRoom;
}

// 根据分店ID获取分店名称
const getBranchNameById = (branchId) => {
  if (!branchId || !branchList.value.length) return null;

  const branch = branchList.value.find(b => b.id == branchId);
  return branch ? branch.name : null;
}

// 处理真实API数据
const handleRealApiData = (res, size) => {
  // 检查数据结构，可能是直接在data中，也可能在data.records中
  let records = res.data.records || res.data.list || res.data;
  // 优先使用后端返回的总数，如果没有则使用当前记录数
  let totalCount = res.data.total || res.data.totalElements || res.data.totalCount || records.length;
  let currentPageSize = res.data.size || res.data.pageSize || size;

  if (Array.isArray(records)) {
    // 数据映射和格式化
    const formattedRecords = records.map(formatRoomData);

    roomList.value = formattedRecords;
    pageSize.value = currentPageSize;
    total.value = totalCount;
  } else {
    roomList.value = [];
    total.value = 0;
  }
}

// 加载分店列表
const loadBranches = async () => {
  try {
    const res = await getAllBranchesAPI()
    console.log('分店API响应:', res)

    let branches = []

    // 根据实际API响应结构调整数据访问路径
    if (res && res.code === 1 && res.data) {
      // API响应结构是 { code: 1, msg: '...', data: { records: [...] } }
      branches = res.data.records || res.data.list || res.data || []
    } else if (res && res.code === 200 && res.data) {
      // 备用响应结构 { code: 200, data: [...] }
      branches = res.data.records || res.data.list || res.data || []
    } else if (res && Array.isArray(res)) {
      // 直接返回数组的情况
      branches = res
    } else if (res && res.data && Array.isArray(res.data)) {
      // 数据直接在data字段中
      branches = res.data
    } else {
      console.error('分店API响应格式不正确:', res)
      branches = []
    }

    // 确保分店数据格式正确
    branchList.value = branches.map(branch => ({
      id: branch.id || branch.branchId || branch.branch_id,
      name: branch.name || branch.branchName || branch.branch_name || `分店${branch.id || '未知'}`
    }))

    console.log('处理后的分店列表:', branchList.value)
  } catch (error) {
    console.error('加载分店列表失败:', error)
    branchList.value = []
  }
}

// 页面初始化
onMounted(async () => {
  console.log('房间列表页面 onMounted')
  // 先加载分店数据，再加载房间数据
  await loadBranches()
  loadPagedRooms(currPageNo.value, pageSize.value)
})

// 页面重新激活时刷新数据（从其他页面返回时）
onActivated(async () => {
  console.log('房间列表页面 onActivated')
  // 先加载分店数据，再加载房间数据
  await loadBranches()
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
