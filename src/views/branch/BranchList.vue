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
                         <el-button type="primary" @click="handleSearch">查询</el-button>
                     </el-form-item>
                 </el-form>
                 <el-button type="warning" @click="handleAdd">新增分店</el-button>
                 <el-button type="danger" @click="handleBatchDelete">删除分店</el-button>
             </div>
             <!-- <div class="operation-buttons">
                 <el-button type="warning" @click="handleAdd">新增分店</el-button>
                 <el-button type="danger" @click="handleBatchDelete">删除分店</el-button>
             </div> -->
             <div class="table-container">
                 <el-table
                     :data="tableData" border style="width: 100%" :header-row-style="{color:'#555',textAlign:'center'}">
                     <el-table-column type="selection" width="55" />
                     <el-table-column prop="id" label="编号" width="180" />
                     <el-table-column prop="name" label="分店名称" width="200" />
                     <el-table-column prop="address" label="分店地址" width="300" />
                     <el-table-column prop="phone" label="分店电话" width="150" />
                     <el-table-column prop="roomCount" label="房间总数" width="150" />
                     <el-table-column prop="createTime" label="构建时间" width="180" />
                     <el-table-column label="操作" width="232">
                         <!-- <template #default="{ row }">
                             <el-button type="warning" size="small" @click="handleEdit(row)">
                                 修改
                             </el-button>
                             <el-button type="danger" size="small" @click="handleDelete(row)">
                                 删除
                             </el-button>
                         </template> -->
                         <template #default="scope">
                              <el-button size="small" type="warning" @click="handleEdit(scope.$index, scope.row)" :icon="EditPen">修 改</el-button>
                              <el-button size="small" type="danger" @click="delGoodsDlg.open(scope.row)" :icon="Delete">删 除</el-button>
                         </template>
                     </el-table-column>
                 </el-table>
                 <div class="page">
                      <Page :psize="pageSize" :total="total" @setCurrentPageNo="setCurrentPageNo"></Page>
                </div>
            </div>
            <DelGoodsDlg ref="delGoodsDlg" @update-view="reloadGoods()"></DelGoodsDlg>

                 <!-- 分页 -->
                 <div class="pagination-container">
                     <el-pagination
                         v-model:current-page="pagination.currentPage"
                         v-model:page-size="pagination.pageSize"
                         :page-sizes="[10, 20, 50, 100]"
                         :total="pagination.total"
                         layout="total, sizes, prev, pager, next, jumper"
                         @size-change="handleSizeChange"
                         @current-change="handleCurrentChange"
                     />
                 </div>
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
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="分店照片" prop="photo">
                    <el-input v-model="formData.photo" placeholder="请输入照片URL" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
    <!-- </div> -->
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllBranchAPI, addBranchAPI, updateBranchAPI, deleteBranchAPI } from '@/apis/branch'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增分店')
const formRef = ref()
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  address: '',
  phone: '',
  roomCount: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据 - 模拟酒店分店数据
const tableData = ref([
  {
    id: 997,
    name: '东海酒店',
    address: '东海市太行路32号',
    phone: '067-8321012',
    roomCount: 105,
    createTime: '2025-07-14 22:05:33'
  },
  {
    id: 994,
    name: '西山酒店',
    address: '西山区建设路88号',
    phone: '067-8321013',
    roomCount: 88,
    createTime: '2025-07-14 22:05:33'
  },
  {
    id: 993,
    name: '南湖酒店',
    address: '南湖区湖滨路66号',
    phone: '067-8321014',
    roomCount: 120,
    createTime: '2025-07-14 22:05:33'
  },
  {
    id: 992,
    name: '北城酒店',
    address: '北城区商业街99号',
    phone: '067-8321015',
    roomCount: 95,
    createTime: '2025-07-14 22:05:33'
  },
  {
    id: 990,
    name: '中心酒店',
    address: '市中心广场东路168号',
    phone: '067-8321016',
    roomCount: 150,
    createTime: '2025-07-14 22:05:33'
  },
  {
    id: 989,
    name: '滨江酒店',
    address: '滨江区江滨大道288号',
    phone: '067-8321017',
    roomCount: 78,
    createTime: '2025-07-14 22:05:33'
  },
  {
    id: 988,
    name: '高新酒店',
    address: '高新区科技路188号',
    phone: '067-8321018',
    roomCount: 110,
    createTime: '2025-07-14 22:05:33'
  },
  {
    id: 986,
    name: '开发区酒店',
    address: '开发区工业路66号',
    phone: '067-8321019',
    roomCount: 85,
    createTime: '2025-07-14 22:05:33'
  },
  {
    id: 985,
    name: '新区酒店',
    address: '新区政务路128号',
    phone: '067-8321020',
    roomCount: 92,
    createTime: '2025-07-14 22:05:33'
  },
  {
    id: 982,
    name: '老城酒店',
    address: '老城区古街58号',
    phone: '067-8321021',
    roomCount: 68,
    createTime: '2025-07-14 22:05:33'
  }
])

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  address: '',
  phone: '',
  roomCount: 1,
  photo: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入分店名称', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入分店地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入分店电话', trigger: 'blur' }
  ],
  roomCount: [
    { required: true, message: '请输入房间总数', trigger: 'blur' }
  ]
}

// 方法
const handleSearch = () => {
  console.log('搜索', searchForm)
  loadData()
}

const handleAdd = () => {
  dialogTitle.value = '新增分店'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑分店'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分店吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里调用删除API
    // await deleteBranchAPI(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条数据吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    ElMessage.success('批量删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
  loadData()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    if (formData.id) {
      // 编辑
      // await updateBranchAPI(formData)
      ElMessage.success('更新成功')
    } else {
      // 新增
      // await addBranchAPI(formData)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    address: '',
    phone: '',
    roomCount: 1,
    photo: ''
  })
  formRef.value?.clearValidate()
}

const loadData = async () => {
  loading.value = true
  try {
    // 这里调用API获取数据
    // const result = await getAllBranchAPI({
    //   ...searchForm,
    //   page: pagination.currentPage,
    //   size: pagination.pageSize
    // })
    // tableData.value = result.records
    // pagination.total = result.total

    // 模拟数据已在上面定义
    pagination.total = 100
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.branch {
    margin: 10px;
}

.wrapper {
    padding: 10px;
    margin: 10px;
    background-color: #fff;

    .title {
        background-color: #f6f6f6;
        height: 50px;
        line-height: 50px;
        font-weight: bold;
        padding-left: 10px;
        margin-bottom: 20px;
    }

    .search-form {
        margin-bottom: 15px;
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 4px;
    }

    .operation-buttons {
        margin-bottom: 15px;

        .el-button {
            margin-right: 10px;
        }
    }

    .table-container {
            margin-top: 20px;
            margin-bottom: 20px;
        // .pagination-container {
        //     margin-top: 20px;
        //     text-align: right;
        // }
    }
}
</style>
