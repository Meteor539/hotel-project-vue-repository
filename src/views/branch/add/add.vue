<template>
  <div class="branch-add">
    <div class="wrapper">
      <div class="title">新增分店</div>
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
          <el-input-number v-model="formData.roomCount" :min="1" />
        </el-form-item>
        <el-form-item label="分店照片" prop="photo">
          <UploadImage v-model="formData.photoList" @change="handlePhotoChange" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { addBranchAPI } from '@/apis/branchAPI'
import UploadImage from '@/components/UploadImage.vue'

const formRef = ref()
const formData = reactive({
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
  phone: [
    { required: true, message: '请输入分店电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  roomCount: [
    { required: true, message: '请输入房间总数', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '房间总数必须在 1 到 1000 之间', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 调用API新增分店
    await addBranchAPI(formData)
    
    console.log('提交数据:', formData)
    ElMessage.success('新增分店成功')
    
    // 重置表单
    handleReset()
  } catch (error) {
    console.error('新增分店失败:', error)
    ElMessage.error('新增分店失败')
  }
}

const handleReset = () => {
  formRef.value.resetFields()
}

// 处理照片变化
const handlePhotoChange = (photoUrls) => {
  // TODO: 根据后端接口要求处理照片数据
  // 目前将第一张照片作为主照片存储到 photo 字段
  formData.photo = photoUrls.length > 0 ? photoUrls[0] : ''
  console.log('照片列表更新:', photoUrls)
}
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
