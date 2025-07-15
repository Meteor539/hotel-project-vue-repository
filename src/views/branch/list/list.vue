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
              <el-button type="warning" size="small" :icon="EditPen" @click="handleEdit(row)">
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        :model="formData"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="分店名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分店名称" />
        </el-form-item>
        <el-form-item label="分店地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入分店地址" />
        </el-form-item>
        <el-form-item label="分店电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入分店电话" />
        </el-form-item>
        <el-form-item label="房间总数" prop="roomCount">
          <el-input-number
            v-model="formData.roomCount"
            :min="1"
            :max="1000"
            placeholder="请输入房间总数"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, Delete, Plus } from '@element-plus/icons-vue'
import { getPagedBranchesListAPI, addBranchAPI, updateBranchAPI, deleteBranchAPI } from '@/apis/branchAPI'
import Page from '@/components/Page.vue'

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

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  address: '',
  phone: '',
  roomCount: 1
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入分店名称', trigger: 'blur' },
    { min: 2, max: 50, message: '分店名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入分店地址', trigger: 'blur' },
    { min: 5, max: 200, message: '分店地址长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入分店电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  roomCount: [
    { required: true, message: '请输入房间总数', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '房间总数必须在 1 到 1000 之间', trigger: 'blur' }
  ]
}

const formRef = ref()

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

// 新增分店
const handleAdd = () => {
  dialogTitle.value = '新增分店'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑分店
const handleEdit = (row) => {
  dialogTitle.value = '编辑分店'
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
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

// handleSizeChange函数已删除，因为使用了通用分页组件

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      await updateBranchAPI(formData)
      ElMessage.success('修改成功')
    } else {
      await addBranchAPI(formData)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    loadPagedBranches(currPageNo.value, pageSize.value)
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    address: '',
    phone: '',
    roomCount: 1
  })
  formRef.value?.clearValidate()
}

// loadData函数已被loadPagedBranches替代，删除重复代码

const loadPagedBranches = async (pageNo, size = pageSize.value)=>{
    try {
        loading.value = true;
        
        // 尝试调用真实API
        try {
            let res = await getPagedBranchesListAPI(pageNo, size);
            console.log('API响应数据:', res);
            console.log('数据结构:', res.data);
            console.log('res.data的所有属性:', Object.keys(res.data || {}));

            if (res && res.data) {
                // 处理真实API数据
                handleRealApiData(res, size);
                return;
            }
        } catch (apiError) {
            console.warn('API调用失败，使用模拟数据:', apiError.message);
            // 使用模拟数据进行分页测试
            handleMockData(pageNo, size);
            return;
        }

    } catch (error) {
        console.error('加载分店数据失败:', error);
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

    console.log('解析后的records:', records);
    console.log('解析后的total:', totalCount);
    console.log('解析后的size:', currentPageSize);

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

            // 格式化日期时间
            if (formattedBranch.createTime) {
                const date = new Date(formattedBranch.createTime);
                formattedBranch.createTime = date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }

            return formattedBranch;
        });

        console.log('格式化后的数据:', formattedRecords);

        tableData.value = formattedRecords;
        pageSize.value = currentPageSize;
        total.value = totalCount;

        console.log('最终设置的总数:', total.value);
    }
}

// 处理模拟数据（用于测试分页功能）
const handleMockData = (pageNo, size) => {
    console.log(`加载模拟数据 - 页码: ${pageNo}, 每页: ${size}`);
    
    // 生成模拟数据
    const mockData = [];
    const totalMockRecords = 157; // 模拟总记录数
    
    // 计算当前页的数据范围
    const startIndex = (pageNo - 1) * size;
    const endIndex = Math.min(startIndex + size, totalMockRecords);
    
    for (let i = startIndex; i < endIndex; i++) {
        mockData.push({
            id: i + 1,
            name: `分店${i + 1}`,
            address: `测试地址${i + 1}号`,
            phone: `138${String(i).padStart(8, '0')}`,
            roomCount: Math.floor(Math.random() * 100) + 50,
            createTime: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleString('zh-CN')
        });
    }
    
    tableData.value = mockData;
    total.value = totalMockRecords;
    pageSize.value = size;
    
    console.log(`模拟数据加载完成 - 当前页: ${pageNo}, 显示: ${mockData.length}条, 总计: ${totalMockRecords}条`);
}

// 对话框关闭处理
const handleDialogClose = () => {
  resetForm()
}

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
    border-radius: 8px;
    padding: 20px;
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
