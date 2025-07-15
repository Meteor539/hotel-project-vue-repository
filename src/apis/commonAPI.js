import httpInstance from "@/utils/request";

// 服务器主机地址 - 使用与请求实例相同的基础URL
export const host = 'http://localhost:4000/api';

// 文件上传接口
export const uploadFileUrl = host + "/file/upload";

// 文件上传API
export function uploadFileAPI(formData) {
  return httpInstance({
    url: 'file/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
