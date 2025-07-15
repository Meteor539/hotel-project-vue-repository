import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/login/LoginView.vue'
import Layout from '@/views/layout/LayoutView.vue'

// 分店管理
import Branch from '@/views/branch/Branch.vue'
import BranchList from '@/views/branch/list/list.vue'
import BranchAdd from '@/views/branch/add/add.vue'

// 房间管理
import Room from '@/views/room/Room.vue'
import RoomList from '@/views/room/list/list.vue'
import RoomAdd from '@/views/room/add/add.vue'
import RoomStatus from '@/views/room/status/status.vue'

// 用户管理
import User from '@/views/user/User.vue'
import UserList from '@/views/user/list/list.vue'
import UserAdmin from '@/views/user/admin/admin.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: '/branch/list',
      children:[
        {
          path:"/branch",
          component:Branch,
          children:[
            {
              path:"list",
              component:BranchList
            },
            {
              path:"add",
              component:BranchAdd
            }
          ]
        },
        {
          path:"/room",
          component:Room,
          children:[
            {
              path:"list",
              component:RoomList
            },
            {
              path:"add",
              component:RoomAdd
            },
            {
              path:"status",
              component:RoomStatus
            }
          ]
        },
        {
          path:"/user",
          component:User,
          children:[
            {
              path:"list",
              component:UserList
            },
            {
              path:"admin",
              component:UserAdmin
            }
          ]
        }
      ]
    },
    {
      path: '/login',
      component: Login
    }
  ]
})

export default router
