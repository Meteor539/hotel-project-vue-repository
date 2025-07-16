import { roomHttpInstance } from "@/utils/request";

// ==================== 房间列表相关接口 ====================

//查询分页房间列表 - 按照API文档要求调整
export function getPagedRoomsListAPI(pageNo = 1){
     return roomHttpInstance({
        url:`room/list?pageNo=${pageNo}`
     })
}

// 根据房间类型获取房间列表
export function getRoomsByTypeAPI(roomType){
   return roomHttpInstance({
      url:`room/roomType/${roomType}`,
      method:'GET'
   })
}

// 根据房间状态获取房间列表
export function getRoomsByStatusAPI(roomStatus){
   return roomHttpInstance({
      url:`room/roomStatus/${roomStatus}`,
      method:'GET'
   })
}

// 根据分店名称获取房间列表
export function getRoomsByBranchNameAPI(branchName){
   return roomHttpInstance({
      url:`room/branchName/${branchName}`,
      method:'GET'
   })
}

// 根据分店ID获取房间列表
export function getRoomsByBranchIdAPI(branchId){
   return roomHttpInstance({
      url:`room/branchId/${branchId}`,
      method:'GET'
   })
}

// ==================== 房间管理相关接口 ====================

//新增房间
export function addRoomAPI(data){
   return roomHttpInstance({
      url:'room/save',
      method:'POST',
      data
   })
}

//更新房间
export function updateRoomAPI(data){
   return roomHttpInstance({
      url:'room/update',
      method:'PUT',
      data
   })
}

//删除房间
export function deleteRoomAPI(id){
   return roomHttpInstance({
      url:`room/delete/${id}`,
      method:'DELETE'
   })
}

//根据ID查询房间详情
export function getRoomByIdAPI(id){
   return roomHttpInstance({
      url:`room/${id}`,
      method:'GET'
   })
}

// 注意：getAllBranchesAPI 已移动到 branchAPI.js 中
