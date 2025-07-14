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
          <el-input v-model="formData.photo" placeholder="请输入照片URL" />
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

const formRef = ref()
const formData = reactive({
  name: '',
  address: '',
  phone: '',
  roomCount: 1,
  photo: ''
})

const rules = {
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

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    console.log('提交数据:', formData)
    ElMessage.success('新增分店成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleReset = () => {
  formRef.value.resetFields()
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
