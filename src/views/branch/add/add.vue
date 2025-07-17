<template>
  <div class="branch-add">
    <div class="wrapper">
      <div class="title">{{ isEdit ? '编辑分店' : '新增分店' }}</div>
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
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
          <el-input-number v-model="formData.roomCount" :min="1" :precision="0" :controls-position="'right'" />
        </el-form-item>
        <el-form-item label="分店照片" prop="photo">
          <BranchUploadImage
            v-model="formData.photoList"
            :initial-images="formData.photoList"
            :max-count="5"
            @change="handlePhotoChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">{{ isEdit ? '更 新' : '新 增' }}</el-button>
          <el-button @click="handleCancel">取 消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addBranchAPI, updateBranchAPI, getBranchByIdAPI } from '@/apis/branchAPI'
import { createPhoneRules } from '@/utils/validators'
import BranchUploadImage from '@/components/BranchUploadImage.vue'

const router = useRouter()
const route = useRoute()
const formRef = ref()

// 判断是否为编辑模式
const isEdit = ref(false)

const formData = reactive({
  id: null,
  name: '',
  address: '',
  phone: '',
  roomCount: 1,
  photo: '', // 保留原字段用于后端兼容
  photoList: [] // 新增照片列表字段
})

const rules = {
  name: [
    { required: true, message: '请输入分店名称', trigger: 'blur' },
    { min: 2, max: 50, message: '分店名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入分店地址', trigger: 'blur' },
    { min: 5, max: 200, message: '分店地址长度在 5 到 200 个字符', trigger: 'blur' }
  ],
  phone: createPhoneRules(true, '请输入分店电话'),
  roomCount: [
    { required: true, message: '请输入房间总数', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '房间总数必须在 1 到 1000 之间', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      // 准备更新数据，将表单字段映射为API期望的字段
      const updateData = {
        branchId: formData.id,
        branchName: formData.name,
        branchAddress: formData.address,
        branchPhone: formData.phone,
        roomCount: formData.roomCount,
        branchPicUrl: formData.photo
      }

      console.log('提交更新数据:', updateData)
      // 调用API更新分店
      await updateBranchAPI(updateData)

      // 显示成功提示
      ElMessage({
        message: '修改分店成功！',
        type: 'success',
        duration: 2000
      })

      // 延迟跳转，确保提示消息显示
      setTimeout(() => {
        router.push('/branch/list')
      }, 2000)
    } else {
      // 新增模式，准备新增数据
      const addData = {
        branchName: formData.name,
        branchAddress: formData.address,
        branchPhone: formData.phone,
        roomCount: formData.roomCount,
        branchPicUrl: formData.photo
      }

      console.log('提交新增数据:', addData)
      // 调用API新增分店
      await addBranchAPI(addData)

      // 显示成功提示
      ElMessage({
        message: '新增分店成功！',
        type: 'success',
        duration: 2000
      })

      // 延迟跳转，确保提示消息显示
      setTimeout(() => {
        router.push('/branch/list')
      }, 2000)
    }
  } catch (error) {
    console.error(isEdit.value ? '更新分店失败:' : '新增分店失败:', error)

    // 显示错误提示
    ElMessage.error(isEdit.value ? '修改分店失败，请重试' : '新增分店失败，请重试')
  }
}

const handleCancel = () => {
  // 取消按钮统一返回列表页
  router.push('/branch/list')
}

// 加载分店详情（编辑模式）
const loadBranchDetail = async (id) => {
  try {
    const res = await getBranchByIdAPI(id)
    console.log('分店详情API响应:', res)

    // 根据实际API响应结构调整数据访问路径
    if (res && res.code === 1 && res.data) {
      // API响应结构是 { code: 1, msg: '...', data: {...} }
      const branchData = res.data

      // 字段映射：API字段名 -> 表单字段名
      formData.id = branchData.branchId
      formData.name = branchData.branchName
      formData.address = branchData.branchAddress
      formData.phone = branchData.branchPhone
      formData.roomCount = branchData.roomCount
      formData.photo = branchData.branchPicUrl || ''

      // 处理照片回显 - 将逗号分隔的URL字符串拆分为数组
      if (branchData.branchPicUrl) {
        console.log('原始照片URL字符串:', branchData.branchPicUrl)
        formData.photoList = branchData.branchPicUrl.split(',').filter(url => url.trim())
        console.log('拆分后的照片数组:', formData.photoList)
      } else {
        formData.photoList = []
      }

      console.log('映射后的表单数据:', formData)
      ElMessage.success('分店信息加载成功')
    } else if (res && res.code === 200 && res.data) {
      // 如果响应结构是 { code: 200, data: {...} }
      const branchData = res.data
      Object.assign(formData, branchData)

      // 处理照片回显 - 将逗号分隔的URL字符串拆分为数组
      if (branchData.branchPicUrl) {
        formData.photoList = branchData.branchPicUrl.split(',').filter(url => url.trim())
      } else {
        formData.photoList = []
      }

      console.log('加载的分店数据:', res.data)
    } else if (res && res.data && res.data.code === 200) {
      // 如果响应结构是 { data: { code: 200, data: {...} } }
      const branchData = res.data.data
      Object.assign(formData, branchData)

      // 处理照片回显 - 将逗号分隔的URL字符串拆分为数组
      if (branchData.branchPicUrl) {
        formData.photoList = branchData.branchPicUrl.split(',').filter(url => url.trim())
      } else {
        formData.photoList = []
      }

      console.log('加载的分店数据:', res.data.data)
    } else {
      console.error('API响应格式异常:', res)
      ElMessage.error('获取分店详情失败')
    }
  } catch (error) {
    console.error('加载分店详情失败:', error)
    ElMessage.error('加载分店详情失败')
  }
}

// 处理照片变化
const handlePhotoChange = (photoUrls) => {
  // 更新照片列表
  formData.photoList = photoUrls

  // 将URL转换为相对路径（去掉域名部分），然后用逗号连接
  const relativePaths = photoUrls.map(url => {
    if (url.startsWith('http://localhost:4000')) {
      return url.replace('http://localhost:4000', '')
    }
    return url // 如果已经是相对路径，直接返回
  })

  formData.photo = relativePaths.length > 0 ? relativePaths.join(',') : ''
  console.log('分店照片列表更新:', photoUrls)
  console.log('相对路径数组:', relativePaths)
  console.log('存储的照片URL字符串:', formData.photo)
}

// 页面初始化
onMounted(() => {
  console.log('页面初始化，路由参数:', route.query)

  // 检查是否为编辑模式
  if (route.query.id && route.query.mode === 'edit') {
    console.log('进入编辑模式，分店ID:', route.query.id)
    isEdit.value = true
    formData.id = route.query.id // 设置表单ID
    loadBranchDetail(route.query.id)
  } else {
    console.log('进入新增模式')
  }
})
</script>

<style lang="scss" scoped>
.branch-add {
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
}
</style>
