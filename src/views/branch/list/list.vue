<template>
  <div class="branch">
    <div class="wrapper">
      <div class="title">分店信息管理</div>
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="分店名称">
            <el-input v-model="searchForm.name" placeholder="分店名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="分店地址">
            <el-input v-model="searchForm.address" placeholder="分店地址" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="分店电话">
            <el-input v-model="searchForm.phone" placeholder="分店电话" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="房间总数">
            <el-input v-model="searchForm.roomCount" placeholder="房间总数" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查 询</el-button>
            <el-button @click="handleReset">重 置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="warning" :icon="Plus" @click="handleAdd">新增分店</el-button>
        <el-button type="danger" :icon="Delete" @click="handleBatchDelete">删除分店</el-button>
      </div>
      <div class="table-container">
        <el-table
          :data="tableData"
          border
          style="width: 100%"
          :header-row-style="{color:'#555',textAlign:'center'}"
          @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="编号" width="100" />
          <el-table-column prop="name" label="分店名称" width="180" />
          <el-table-column prop="address" label="分店地址" />
          <el-table-column prop="phone" label="分店电话" width="180" />
          <el-table-column prop="roomCount" label="房间总数" width="100" />
          <el-table-column prop="createTime" label="构建时间" width="180" />
          <el-table-column label="操作" width="230">
            <template #default="{ row }">
              <el-button type="primary" size="small" :icon="EditPen" @click="handleEdit(row)">
                修 改
              </el-button>
              <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(row)">
                删 除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
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
import { getPagedBranchesListAPI, deleteBranchAPI } from '@/apis/branchAPI'
import Page from '@/components/Page.vue'

// 路由实例
const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  address: '',
  phone: '',
  roomCount: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 当前页号
const currPageNo = ref(1)

// 删除了对话框相关的变量，因为改为跳转到add页面

// 分页相关方法
const setCurrentPageNo = (pageNo)=>{
  currPageNo.value = pageNo;
  currentPage.value = pageNo; // 同步当前页码
  console.log("list.vue",pageNo,currPageNo.value);
  loadPagedBranches(pageNo, pageSize.value);
}

// 搜索功能
const handleSearch = () => {
  console.log('搜索', searchForm)
  currentPage.value = 1 // 重置到第一页
  currPageNo.value = 1
  loadPagedBranches(1, pageSize.value)
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    address: '',
    phone: '',
    roomCount: ''
  })
  currPageNo.value = 1
  currentPage.value = 1
  loadPagedBranches(1, pageSize.value)
}

// 新增分店 - 跳转到add页面
const handleAdd = () => {
  router.push('/branch/add')
}

// 编辑分店 - 跳转到add页面并传递编辑数据
const handleEdit = (row) => {
  router.push({
    path: '/branch/add',
    query: {
      id: row.id,
      mode: 'edit'
    }
  })
}

// 删除分店
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分店吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteBranchAPI(row.id)
    ElMessage.success('删除成功')
    loadPagedBranches(currPageNo.value, pageSize.value)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的分店')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个分店吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 这里应该调用批量删除API，暂时用循环删除
    for (const row of selectedRows.value) {
      await deleteBranchAPI(row.id)
    }
    
    ElMessage.success('批量删除成功')
    loadPagedBranches(currPageNo.value, pageSize.value)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}


// 删除了表单提交和重置函数，因为改为跳转到add页面

// loadData函数已被loadPagedBranches替代，删除重复代码

const loadPagedBranches = async (pageNo, size = pageSize.value)=>{
    try {
        loading.value = true;

        let res = await getPagedBranchesListAPI(pageNo, size);

        if (res && res.data) {
            // 处理真实API数据
            handleRealApiData(res, size);
        } else {
            ElMessage.error('获取分店列表失败')
        }

    } catch (error) {
        console.error('加载分店数据失败:', error);
        ElMessage.error('加载分店数据失败')
    } finally {
        loading.value = false;
    }
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
        const formattedRecords = records.map(branch => {
            // 创建一个新对象，确保字段名称正确
            const formattedBranch = {
                id: branch.id || branch.branchId,
                name: branch.name || branch.branchName,
                address: branch.address || branch.branchAddress,
                phone: branch.phone || branch.branchPhone,
                roomCount: branch.roomCount || branch.totalRooms || 0,
                createTime: branch.createTime || branch.createdTime || branch.createDate
            };

            // 格式化日期时间，与房间列表保持一致的格式
            if (formattedBranch.createTime) {
                const date = new Date(formattedBranch.createTime);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                formattedBranch.createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }

            return formattedBranch;
        });

        tableData.value = formattedRecords;
        pageSize.value = currentPageSize;
        total.value = totalCount;
    }
}

// 模拟数据处理函数已删除，现在只使用真实API数据

// 删除了对话框关闭处理函数

// 生命周期
onMounted(()=>{
    loadPagedBranches(1, pageSize.value);
});

</script>

<style scoped>
.branch {
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
    color: #333;
}

.search-form {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 6px;
    margin-bottom: 20px;
}

.search-form .el-form {
    margin-bottom: 10px;
}

.table-container {
        margin-top: 20px;
        margin-bottom: 20px;
}

.pagination-container {
    margin-top: 20px;
    text-align: right;
}

.dialog-footer {
    text-align: right;
}

.operation-buttons {
    margin-bottom: 20px;
}

.operation-buttons .el-button {
    margin-right: 10px;
}
</style>
