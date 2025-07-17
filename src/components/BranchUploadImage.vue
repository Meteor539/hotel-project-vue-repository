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
    :limit="maxCount"
    :on-exceed="handleExceed"
    name="file"
    :headers="uploadHeaders"
    :data="uploadData"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>

  <el-dialog v-model="dialogVisible">
    <img :src="dialogImageUrl" alt="Preview Image" style="width: 100%" />
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { removeFileAPI } from '@/apis/commonAPI'

// 定义 props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 5
  },
  // 初始图片URL列表（用于编辑模式回显）
  initialImages: {
    type: Array,
    default: () => []
  }
})

// 定义 emits
const emit = defineEmits(['update:modelValue', 'change'])

// 使用相对路径，通过vite代理转发到后端
const uploadFileUrl = '/file/upload'

// 上传请求头 - 不要手动设置Content-Type，让浏览器自动设置
const uploadHeaders = {}

// 上传额外数据
const uploadData = {}

const fileList = ref([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 文件上传前的钩子
const beforeUpload = (file) => {
  console.log('准备上传文件:', {
    name: file.name,
    type: file.type,
    size: file.size,
    sizeInMB: (file.size / 1024 / 1024).toFixed(2)
  })

  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5 // 根据文档，限制为5MB

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('上传图片大小不能超过 5MB!')
    return false
  }

  console.log('文件验证通过，开始上传到:', uploadFileUrl)
  return true
}

// 文件上传成功的钩子
const handleSuccess = (response, uploadFile) => {
  console.log('=== 上传响应详情 ===')
  console.log('完整响应:', response)
  console.log('响应类型:', typeof response)
  console.log('响应的code:', response?.code)
  console.log('响应的data:', response?.data)
  console.log('响应的msg:', response?.msg)
  console.log('上传文件信息:', uploadFile)
  console.log('==================')

  // 检查后端响应
  if (response && response.code === 1 && response.data && response.data !== null) {
    // 上传成功：code=1 且 data不为空
    const imageUrl = response.data

    // 更新uploadFile的url，让Element Plus组件正确显示图片
    // 后端返回的路径如：/uploads/xxx.jpg，需要通过代理访问
    uploadFile.url = imageUrl.startsWith('http') ? imageUrl : `http://localhost:4000${imageUrl}`

    // 获取当前所有图片URL（包括新上传的）
    const allUrls = fileList.value.map(file => {
      const url = file.url || file.response?.data
      // 转换为相对路径发送给父组件
      if (url && url.startsWith('http://localhost:4000')) {
        return url.replace('http://localhost:4000', '')
      }
      return url
    }).filter(Boolean)

    // 发送相对路径给父组件
    emit('update:modelValue', allUrls)
    emit('change', allUrls)

    ElMessage.success('分店照片上传成功!')
  } else {
    // 上传失败，显示后端返回的具体错误信息
    console.error('上传失败，响应数据:', response)
    const errorMsg = response?.msg || '图片上传失败，请重试'
    ElMessage.error(`上传失败: ${errorMsg}`)
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
const handleRemove = async (uploadFile, uploadFiles) => {
  console.log('移除文件:', uploadFile)

  try {
    // 获取要删除的图片URL或路径
    let imageUrl = uploadFile.url || uploadFile.response?.data

    if (imageUrl) {
      let fileName

      // 如果是完整URL（http://localhost:4000/uploads/xxx.jpg），提取文件名
      if (imageUrl.startsWith('http')) {
        fileName = imageUrl.substr(imageUrl.lastIndexOf("/") + 1)
      }
      // 如果是相对路径（/uploads/xxx.jpg），也提取文件名
      else if (imageUrl.startsWith('/uploads/')) {
        fileName = imageUrl.substr(imageUrl.lastIndexOf("/") + 1)
      }
      // 如果直接是response中的data，可能就是相对路径
      else {
        fileName = imageUrl.substr(imageUrl.lastIndexOf("/") + 1)
      }

      console.log("删除图片文件名:", fileName)

      // 调用删除API
      const res = await removeFileAPI(fileName)
      console.log('删除API响应:', res)
      console.log('删除API响应数据:', res.data)

      // 检查响应结构，可能是 res.data.code 或 res.code
      const responseData = res.data || res
      console.log('实际响应数据:', responseData)

      if (responseData && responseData.code === 1) {
        ElMessage({
          message: '分店照片删除成功!',
          type: 'success',
          duration: 1000
        })
      } else {
        console.log('删除失败，响应码:', responseData?.code)
        ElMessage.error('分店照片不存在或者删除失败!')
      }
    }
  } catch (error) {
    console.error('删除图片失败:', error)
    ElMessage.error('删除图片失败，请重试')
  }

  // 更新文件列表 - 需要处理URL格式
  const currentUrls = uploadFiles.map(file => {
    const url = file.url || file.response?.data
    // 如果是完整URL，需要转换回相对路径给父组件
    if (url && url.startsWith('http://localhost:4000')) {
      return url.replace('http://localhost:4000', '')
    }
    return url
  }).filter(Boolean)

  // 发送更新后的图片URL列表给父组件
  emit('update:modelValue', currentUrls)
  emit('change', currentUrls)
}

// 预览图片
const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url || URL.createObjectURL(uploadFile.raw)
  dialogVisible.value = true
}

// 超出文件数量限制时的钩子
const handleExceed = () => {
  ElMessage.warning(`最多只能上传 ${props.maxCount} 张分店照片`)
}



// 初始化文件列表（用于编辑模式回显）
const initializeFileList = () => {
  if (props.initialImages && props.initialImages.length > 0) {
    fileList.value = props.initialImages.map((url, index) => ({
      name: `image-${index}`,
      // 如果是相对路径，直接访问后端服务；如果是绝对路径，直接使用
      url: url.startsWith('http') ? url : `http://localhost:4000${url}`,
      uid: Date.now() + index
    }))
  }
}

// 监听初始图片变化
watch(() => props.initialImages, () => {
  initializeFileList()
}, { immediate: true })

// 组件挂载时初始化
onMounted(() => {
  initializeFileList()
})
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
