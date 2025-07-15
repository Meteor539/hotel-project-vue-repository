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
      meta: { requiresAuth: true },
      children:[
        {
          path:"/branch",
          component:Branch,
          meta: { requiresAuth: true },
          children:[
            {
              path:"list",
              component:BranchList,
              meta: { requiresAuth: true }
            },
            {
              path:"add",
              component:BranchAdd,
              meta: { requiresAuth: true }
            }
          ]
        },
        {
          path:"/room",
          component:Room,
          meta: { requiresAuth: true },
          children:[
            {
              path:"list",
              component:RoomList,
              meta: { requiresAuth: true }
            },
            {
              path:"add",
              component:RoomAdd,
              meta: { requiresAuth: true }
            },
            {
              path:"status",
              component:RoomStatus,
              meta: { requiresAuth: true }
            }
          ]
        },
        {
          path:"/user",
          component:User,
          meta: { requiresAuth: true },
          children:[
            {
              path:"list",
              component:UserList,
              meta: { requiresAuth: true }
            },
            {
              path:"admin",
              component:UserAdmin,
              meta: { requiresAuth: true }
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

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否有token
    const token = localStorage.getItem('token')
    if (!token) {
      // 没有token，跳转到登录页
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
