import { roomHttpInstance } from "@/utils/request";

//查询分页房间列表
export function getPagedRoomsListAPI(pageNo = 1, pageSize = 10){
     return roomHttpInstance({
        url:`room/list?pageNo=${pageNo}&pageSize=${pageSize}`
     })
}

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

//根据ID查询房间详情（通过列表API获取）
export function getRoomByIdAPI(id){
   return roomHttpInstance({
      url:`room/list?pageNo=1&pageSize=100`,
      method:'GET'
   })
}

// 注意：getAllBranchesAPI 已移动到 branchAPI.js 中
