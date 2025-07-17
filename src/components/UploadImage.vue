<template>
  <el-upload
    v-model:file-list="fileList"
    :action="uploadFileUrl"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
    :on-success="handleSuccess"
    :on-error="handleError"
    :before-upload="beforeUpload"
    name="file"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>

  <el-dialog v-model="dialogVisible">
    <img :src="dialogImageUrl" alt="Preview Image" style="width: 100%" />
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 定义 props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 5
  }
})

// 定义 emits
const emit = defineEmits(['update:modelValue', 'change'])

// 上传文件的URL - 使用相对路径，通过vite代理转发到后端
const uploadFileUrl = ref('/file/upload')

const fileList = ref([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 文件上传前的钩子
const beforeUpload = (file) => {
  // TODO: 添加文件类型和大小验证
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 文件上传成功的钩子
const handleSuccess = (response, uploadFile) => {
  console.log('上传成功:', response)

  // 根据后端返回格式，只要有data字段且不为null就认为上传成功
  if (response && response.data && response.data !== null) {
    const imageUrl = response.data

    // 更新文件列表
    const newFileList = [...fileList.value]
    const currentUrls = newFileList.map(file => file.url || file.response?.data)

    // 发送图片URL给父组件
    emit('update:modelValue', [...currentUrls, imageUrl])
    emit('change', [...currentUrls, imageUrl])

    ElMessage.success('图片上传成功!')
  } else {
    console.error('上传失败，响应数据:', response)
    ElMessage.error('图片上传失败，请重试')
    // 移除上传失败的文件
    const index = fileList.value.findIndex(file => file.uid === uploadFile.uid)
    if (index > -1) {
      fileList.value.splice(index, 1)
    }
  }
}

// 文件上传失败的钩子
const handleError = (error, uploadFile) => {
  console.error('上传失败:', error)
  ElMessage.error('图片上传失败，请重试')

  // 移除上传失败的文件
  const index = fileList.value.findIndex(file => file.uid === uploadFile.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

// 文件移除的钩子
const handleRemove = (uploadFile, uploadFiles) => {
  console.log('移除文件:', uploadFile, uploadFiles)
  
  // 更新文件列表
  const currentUrls = uploadFiles.map(file => file.url || file.response?.data).filter(Boolean)
  
  // 发送更新后的图片URL列表给父组件
  emit('update:modelValue', currentUrls)
  emit('change', currentUrls)
}

// 预览图片
const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url || URL.createObjectURL(uploadFile.raw)
  dialogVisible.value = true
}

// 监听 props 变化，同步 fileList
// TODO: 如果需要支持初始值回显，可以在这里处理
</script>

<style scoped>
/* 自定义样式 */
:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 100px;
  height: 100px;
}
</style>
