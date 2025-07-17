import httpInstance from "@/utils/request";
import axios from 'axios';

// 服务器主机地址 - 使用与请求实例相同的基础URL
export const host = 'http://localhost:4000/api';

// 文件上传接口
export const uploadFileUrl = host + "/file/upload";

// 文件服务HTTP实例（直接使用/file路径，不加/api前缀）
const fileHttpInstance = axios.create({
    baseURL: '/file',
    timeout: 5000
});

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

// 文件删除API - 使用专门的文件服务实例
export function removeFileAPI(fileName) {
  return fileHttpInstance({
    url: `remove/${fileName}`,
    method: 'GET'
  });
}
