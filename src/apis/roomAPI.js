import httpInstance from "@/utils/request";

//查询分页房间列表
export function getPagedRoomsListAPI(pageNo = 1, pageSize = 10){
     return httpInstance({
        url:`room/list?pageNo=${pageNo}&pageSize=${pageSize}`
     })
}

//新增房间
export function addRoomAPI(data){
   return httpInstance({
      url:'room/save',
      method:'POST',
      data
   })
}

//更新房间
export function updateRoomAPI(data){
   return httpInstance({
      url:'room/update',
      method:'PUT',
      data
   })
}

//删除房间
export function deleteRoomAPI(id){
   return httpInstance({
      url:`room/delete/${id}`,
      method:'DELETE'
   })
}

//根据ID查询房间详情
export function getRoomByIdAPI(id){
   return httpInstance({
      url:`room/${id}`,
      method:'GET'
   })
}

// 注意：getAllBranchesAPI 已移动到 branchAPI.js 中
