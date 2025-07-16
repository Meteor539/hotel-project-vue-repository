<template>
  <div class="room-add">
    <div class="wrapper">
      <div class="title">{{ isEdit ? '编辑房间' : '新增房间' }}</div>
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="房间号" prop="roomNumber">
          <el-input v-model="formData.roomNumber" placeholder="请输入房间号" />
        </el-form-item>
        <el-form-item label="所属分店" prop="branchId">
          <el-select v-model="formData.branchId" placeholder="请选择所属分店" style="width: 100%">
            <el-option
              v-for="branch in branchList"
              :key="branch.id"
              :label="branch.name"
              :value="branch.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房间类型" prop="roomType">
          <el-select v-model="formData.roomType" placeholder="请选择房间类型" style="width: 100%">
            <el-option label="普单人间" value="普单人间" />
            <el-option label="普双人间" value="普双人间" />
            <el-option label="三人间" value="三人间" />
            <el-option label="商务套房" value="商务套房" />
            <el-option label="贵宾套房" value="贵宾套房" />
          </el-select>
        </el-form-item>
        <el-form-item label="屋内设施" prop="facilities">
          <el-checkbox-group v-model="formData.facilitiesList">
            <el-checkbox label="平面液晶电视">平面液晶电视</el-checkbox>
            <el-checkbox label="冰箱">冰箱</el-checkbox>
            <el-checkbox label="空调">空调</el-checkbox>
            <el-checkbox label="卫星电视">卫星电视</el-checkbox>
            <el-checkbox label="互联网接入">互联网接入</el-checkbox>
            <el-checkbox label="冲浪浴缸">冲浪浴缸</el-checkbox>
            <el-checkbox label="观海景">观海景</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="房间状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择房间状态" style="width: 100%">
            <el-option label="未入住" value="未入住" />
            <el-option label="有住客" value="有住客" />
            <el-option label="已预订" value="已预订" />
            <el-option label="保洁中" value="保洁中" />
            <el-option label="已退房未保洁" value="已退房未保洁" />
            <el-option label="维修中" value="维修中" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注说明" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明"
          />
        </el-form-item>
        <el-form-item label="房间照片" prop="photo">
          <UploadImage v-model="formData.photoList" @change="handlePhotoChange" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">{{ isEdit ? '更新' : '新增' }}</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addRoomAPI, updateRoomAPI, getRoomByIdAPI } from '@/apis/roomAPI'
import { getAllBranchesAPI } from '@/apis/branchAPI'
import UploadImage from '@/components/UploadImage.vue'

const router = useRouter()
const route = useRoute()
const formRef = ref()

// 判断是否为编辑模式
const isEdit = ref(false)
const branchList = ref([])

// 表单数据
const formData = reactive({
  id: null,
  roomNumber: '',
  branchId: null,
  roomType: '',
  facilitiesList: [], // 设施复选框列表
  facilities: '', // 设施字符串（用于后端）
  status: '未入住',
  remark: '',
  photo: '', // 保留原字段用于后端兼容
  photoList: [] // 新增照片列表字段
})

// 表单验证规则
const rules = {
  roomNumber: [
    { required: true, message: '请输入房间号', trigger: 'blur' },
    { min: 1, max: 20, message: '房间号长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  branchId: [
    { required: true, message: '请选择所属分店', trigger: 'change' }
  ],
  roomType: [
    { required: true, message: '请选择房间类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择房间状态', trigger: 'change' }
  ]
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
      branches = res.data
    } else {
      console.error('分店API响应格式不正确:', res)
      ElMessage.error('分店数据格式错误')
      branches = []
    }

    // 确保分店数据格式正确，统一字段映射
    branchList.value = branches.map(branch => ({
      id: branch.id || branch.branchId || branch.branch_id,
      name: branch.name || branch.branchName || branch.branch_name || `分店${branch.id || '未知'}`
    }))

    console.log('处理后的分店列表:', branchList.value)
  } catch (error) {
    console.error('加载分店列表失败:', error)
    ElMessage.error('加载分店列表失败')
    branchList.value = []
  }
}

// 加载房间详情（编辑模式）
const loadRoomDetail = async (id) => {
  try {
    console.log('页面初始化，路由参数:', { id, mode: route.query.mode })
    console.log('进入编辑模式，房间ID:', id)

    const res = await getRoomByIdAPI(id)
    console.log('房间详情API响应:', res)

    // 根据新的API文档，直接从data中获取房间数据
    if (res && res.code === 1 && res.data) {
      const roomData = res.data

      if (roomData) {
        console.log('找到房间数据:', roomData)

        // 字段映射：API字段名 -> 表单字段名
        formData.id = roomData.roomId
        formData.roomNumber = roomData.roomNo
        formData.branchId = roomData.branchId
        formData.roomType = roomData.roomType
        formData.status = roomData.roomStatus || '未入住'
        formData.remark = roomData.roomRemark || ''
        formData.photo = roomData.roomPhoto || ''

        // 处理设施数据回显
        if (roomData.roomFacilities) {
          const facilitiesStr = roomData.roomFacilities || ''
          formData.facilities = facilitiesStr
          formData.facilitiesList = facilitiesStr.split('，').filter(item => item.trim())
        }

        console.log('映射后的表单数据:', formData)
        ElMessage.success('房间信息加载成功')
      } else {
        console.error('未找到指定ID的房间:', id)
        ElMessage.error('未找到指定的房间信息')
      }
    } else {
      console.error('API响应格式异常:', res)
      ElMessage.error('获取房间详情失败')
    }
  } catch (error) {
    console.error('加载房间详情失败:', error)
    ElMessage.error('加载房间详情失败')
  }
}

// 处理设施列表变化
const handleFacilitiesChange = () => {
  // 将设施列表转换为字符串，用于后端存储
  formData.facilities = formData.facilitiesList.join('，')
}

// 监听设施列表变化
watch(() => formData.facilitiesList, handleFacilitiesChange, { deep: true })

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    // 确保设施字符串已更新
    handleFacilitiesChange()

    if (isEdit.value) {
      // 准备更新数据，将表单字段映射为API期望的字段
      const updateData = {
        roomId: formData.id,
        branchId: formData.branchId,
        roomNo: formData.roomNumber,
        roomType: formData.roomType,
        roomFacilities: formData.facilities,
        roomStatus: formData.status,
        roomRemark: formData.remark
      }

      console.log('提交更新数据:', updateData)
      await updateRoomAPI(updateData)
      ElMessage.success('更新成功')
    } else {
      // 新增模式，准备新增数据
      const addData = {
        branchId: formData.branchId,
        roomNo: formData.roomNumber,
        roomType: formData.roomType,
        roomFacilities: formData.facilities,
        roomStatus: formData.status,
        roomRemark: formData.remark
      }

      console.log('提交新增数据:', addData)
      await addRoomAPI(addData)
      ElMessage.success('新增成功')
    }

    router.push('/room/list')
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  }
}

// 取消操作
const handleCancel = () => {
  router.push('/room/list')
}

// 处理照片变化
const handlePhotoChange = (photoUrls) => {
  // TODO: 根据后端接口要求处理照片数据
  // 目前将第一张照片作为主照片存储到 photo 字段
  formData.photo = photoUrls.length > 0 ? photoUrls[0] : ''
  console.log('照片列表更新:', photoUrls)
}

// 页面初始化
onMounted(() => {
  loadBranches()
  
  // 检查是否为编辑模式
  if (route.query.id && route.query.mode === 'edit') {
    isEdit.value = true
    loadRoomDetail(route.query.id)
  }
})
</script>

<style scoped>
.room-add {
  padding: 20px;
}

.wrapper {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #303133;
  text-align: center;
}

.el-form {
  max-width: 600px;
  margin: 0 auto;
}

.el-form-item {
  margin-bottom: 22px;
}
</style>
