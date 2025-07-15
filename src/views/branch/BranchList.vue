<!-- <script setup>
   
   import { onMounted, ref } from 'vue'
   import {getPagedBranchesListAPI} from '@/apis/branch'

   //分页组件的当前页号
   const currentPage = ref(1);
   const pageSize = ref(10);
   const small = ref(false);
   const background = ref(false);
   const disabled = ref(false);

   //当前访问的页面发生的改变的时候触发
   const handleCurrentChange = (val) => {
    console.log(`current page: ${val}`)
   }

   const setCurrentPageNo = (pageNo)=>{
    currPageNo.value = pageNo;
    // console.log("list.vue",pageNo,currPageNo.value);
    loadPagedBranches(pageNo);
  }

   const props = defineProps({
      psize:{
         type:Number,
         default:10
      },
      total:{
         type:Number,
         default:100
      }
   });

   const emit = defineEmits(['setCurrentPageNo']);

  onMounted(()=>{
    loadPagedBranches(1);
  });

</script> -->

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
                     :data="tableData"
                     border
                     style="width: 100%"
                     :header-row-style="{color:'#555',textAlign:'center'}"
                     @selection-change="handleSelectionChange">
                     <el-table-column type="selection" width="55" />
                     <el-table-column prop="id" label="编号" width="100" />
                     <el-table-column prop="name" label="分店名称" width="180" />
                     <!-- <el-table-column prop="address" label="分店地址" width="406" /> -->
                     <el-table-column prop="address" label="分店地址" />
                     <el-table-column prop="phone" label="分店电话" width="180" />
                     <el-table-column prop="roomCount" label="房间总数" width="100" />
                     <el-table-column prop="createTime" label="构建时间" width="180" />
                     <el-table-column label="操作" width="230">
                         <!-- <template #default="{ row }">
                             <el-button type="warning" size="small" @click="handleEdit(row)">
                                 修改
                             </el-button>
                             <el-button type="danger" size="small" @click="handleDelete(row)">
                                 删除
                             </el-button>
                         </template> -->
                         <template #default="{ row }">
                             <el-button type="warning" size="small" @click="handleEdit(row)">
                                 修改
                             </el-button>
                             <el-button type="danger" size="small" @click="handleDelete(row)">
                                 删除
                             </el-button>
                         </template>
                     </el-table-column>
                 </el-table>
            </div>

                 <!-- 分页 -->
                 <div class="pagination-container">
                     <el-pagination
                        v-model:current-page="currentPage"
                        v-model:page-size="pageSize"
                        :small="small"
                        :disabled="disabled"
                        :background="background"
                        layout="total, sizes, prev, pager, next, jumper"
                        :page-sizes="[10, 20, 50, 100]"
                        :total="total"
                        @current-change="setCurrentPageNo"
                        @size-change="handleSizeChange"
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
// import { getAllBranchAPI, addBranchAPI, updateBranchAPI, deleteBranchAPI } from '@/apis/branch'
   import {getPagedBranchesListAPI} from '@/apis/branch'

   //分页组件的当前页号
   const currentPage = ref(1);
   const currPageNo = ref(1);
   const pageSize = ref(10);
   const total = ref(0);
   const small = ref(false);
   const background = ref(false);
   const disabled = ref(false);



   const setCurrentPageNo = (pageNo)=>{
    currPageNo.value = pageNo;
    currentPage.value = pageNo; // 同步当前页码
    console.log("BranchList.vue",pageNo,currPageNo.value);
    loadPagedBranches(pageNo, pageSize.value);
  }

// props和emit定义已在下面，删除重复定义

  onMounted(()=>{
    loadPagedBranches(1, pageSize.value);
});

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增分店')
const formRef = ref()
const selectedRows = ref([])
const tableData = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  address: '',
  phone: '',
  roomCount: ''
})

// 分页数据已在上面定义，这里删除重复定义

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
  currentPage.value = 1 // 重置到第一页
  currPageNo.value = 1
  loadPagedBranches(1, pageSize.value)
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
    await ElMessageBox.confirm(`确定要删除分店 "${row.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里调用删除API
    // await deleteBranchAPI(row.id)
    ElMessage.success('删除成功')
    loadPagedBranches(currPageNo.value, pageSize.value)
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
    loadPagedBranches(currPageNo.value, pageSize.value)
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
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  currPageNo.value = 1
  loadPagedBranches(1, size)
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
    loadPagedBranches(currPageNo.value, pageSize.value)
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

// loadData函数已被loadPagedBranches替代，删除重复代码

const loadPagedBranches = async (pageNo, size = pageSize.value)=>{
    try {
        loading.value = true;
        let res = await getPagedBranchesListAPI(pageNo, size);
        console.log('API响应数据:', res);
        console.log('数据结构:', res.data);
        console.log('res.data的所有属性:', Object.keys(res.data || {}));

        if (res && res.data) {
            // 检查数据结构，可能是直接在data中，也可能在data.records中
            let records = res.data.records || res.data.list || res.data;
            // 优先使用后端返回的总数，如果没有则使用当前记录数
            let totalCount = res.data.total || res.data.totalElements || res.data.totalCount || records.length;
            let currentPageSize = res.data.size || res.data.pageSize || 10;

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

                // 如果没有数据，添加一些测试数据用于调试
                if (formattedRecords.length === 0) {
                    console.log('没有数据，添加测试数据');
                    tableData.value = [
                        {
                            id: 1,
                            name: '测试分店1',
                            address: '测试地址1',
                            phone: '13800138001',
                            roomCount: 50,
                            createTime: '2025-07-14 12:00:00'
                        },
                        {
                            id: 2,
                            name: '测试分店2',
                            address: '测试地址2',
                            phone: '13800138002',
                            roomCount: 80,
                            createTime: '2025-07-14 13:00:00'
                        }
                    ];
                    total.value = 2;
                }
            } else {
                // ElMessage.error('数据格式错误');
            }
        } else {
            ElMessage.error('无法获取数据');
        }
    } catch (error) {
        console.error('加载分店数据失败:', error);
    } finally {
        loading.value = false;
    }
}

// // 生命周期
// onMounted(() => {
//   loadData()
// })
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
    }

    .pagination-container {
        margin-top: 20px;
        text-align: right;
    }
}
</style>