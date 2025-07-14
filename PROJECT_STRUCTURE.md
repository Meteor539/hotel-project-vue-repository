# 酒店分店管理系统前端项目

## 项目概述
基于 Vue3 + Element Plus 的酒店分店管理系统前端，按照参考文档的标准实现了完整的管理后台界面。

## 技术栈
- **Vue 3** - 前端框架 (Composition API)
- **Element Plus** - UI组件库 (自动导入)
- **Vue Router** - 路由管理 (三级路由)
- **Pinia** - 状态管理
- **Axios** - HTTP请求库
- **Vite** - 构建工具
- **Sass** - CSS预处理器
- **normalize.css** - 浏览器兼容性

## 项目结构
```
hotel-admin-vue/
├── 🔧 配置文件层
│   ├── package.json          # 项目依赖和脚本
│   ├── vite.config.js        # Vite构建配置 + Element Plus自动导入
│   ├── jsconfig.json         # Element Plus类型提示
│   └── eslint.config.js      # 代码规范配置
│
├── 📁 src/ (源代码核心)
│   ├── 🚪 main.js            # 应用程序入口
│   ├── 🎯 App.vue            # 根组件
│   │
│   ├── 📱 views/             # 页面视图层
│   │   ├── 🔐 login/         # 登录模块
│   │   │   └── LoginView.vue # 登录页面
│   │   ├── 🏠 layout/        # 布局框架
│   │   │   ├── LayoutView.vue # 主布局组件
│   │   │   ├── menu/Menu.vue  # 左侧菜单组件
│   │   │   └── content/Content.vue # 内容区域组件
│   │   ├── 🏨 branch/        # 分店管理
│   │   │   ├── Branch.vue    # 分店管理路由容器
│   │   │   ├── BranchList.vue # 分店列表页面
│   │   │   └── BranchAdd.vue  # 新增分店页面
│   │   ├── 🏠 room/          # 房间管理
│   │   └── 👥 user/          # 用户管理
│   │
│   ├── 🧩 components/        # 可复用组件
│   ├── 🛣️ router/           # 路由配置
│   │   └── index.js         # 三级路由定义
│   ├── 🗃️ stores/           # 状态管理(Pinia)
│   ├── 🌐 apis/             # API接口层
│   │   ├── index.js         # API统一导出
│   │   └── branch.js        # 分店相关API
│   ├── 🔧 utils/            # 工具函数
│   │   └── http.js          # Axios请求封装
│   └── 🎨 assets/           # 静态资源
│
└── 📁 public/               # 公共静态文件
```

## 安装依赖
```bash
# 安装基础依赖
npm install

# 安装必要的依赖包
npm install element-plus --save
npm install -D unplugin-vue-components unplugin-auto-import
npm install axios --save
npm install sass -D
npm install normalize.css -S
```

## 启动项目
```bash
# 开发环境启动
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 功能特性

### 1. 登录系统
- 路径: `/login`
- 用户名: admin
- 密码: 123456
- 登录后跳转到分店列表页面

### 2. 主布局系统
- **左侧菜单**: 深蓝色背景 (#112f50)，支持折叠展开
- **顶部区域**: 蓝色背景 (#1e78bf)，包含折叠按钮
- **内容区域**: 白色背景，自适应布局
- **菜单折叠**: 点击折叠按钮可收起/展开菜单

### 3. 分店管理功能
- **路径**: `/branch/list`
- **功能包括**：
  - 🔍 多条件搜索 (分店名称、地址、电话、房间总数)
  - ➕ 新增分店
  - ✏️ 编辑分店信息
  - 🗑️ 删除分店
  - 📄 分页显示
  - ☑️ 批量删除操作

### 4. 数据表格
- 显示分店编号、名称、地址、电话、房间总数、创建时间
- 支持选择多行进行批量操作
- 每行提供修改和删除操作按钮
- 分页组件支持页面大小调整

### 5. 三级路由结构
```
/ (Layout)
├── /branch (Branch)
│   ├── /branch/list (分店列表)
│   └── /branch/add (新增分店)
├── /room (Room)
│   ├── /room/list (房间列表)
│   └── /room/status (房间状态)
└── /user (User)
    ├── /user/list (用户列表)
    └── /user/admin (管理员)
```

## API接口说明

### 分店管理接口
```javascript
// 获取所有分店列表
GET /api/branch/all

// 新增分店
POST /api/branch/save

// 更新分店
PUT /api/branch/update

// 删除分店
DELETE /api/branch/delete/{id}
```

## 开发说明

### 1. Element Plus自动导入
项目已配置Element Plus自动导入，无需手动引入组件：
```javascript
// vite.config.js 已配置
AutoImport({
  resolvers: [ElementPlusResolver()],
}),
Components({
  resolvers: [ElementPlusResolver()],
}),
```

### 2. 样式规范
- 使用 Sass 预处理器
- 遵循参考文档的样式规范
- 主要颜色：
  - 菜单背景: #112f50
  - 头部背景: #1e78bf
  - 激活状态: #1e78bf
  - 内容背景: #fff

### 3. 组件通信
- 父子组件通过 props 和 emit 通信
- 菜单折叠状态通过 Layout → Menu/Content 传递

## 页面效果
实现了与您提供截图相似的界面效果：
- 蓝色顶部导航栏显示 "酒店管理系统后台 v1.0"
- 左侧深色菜单栏包含分店管理、房间管理、用户管理
- 主内容区域包含搜索表单、操作按钮和数据表格
- 表格显示分店信息，每行有修改和删除按钮
- 底部分页组件

## 注意事项
1. 当前使用模拟数据，实际开发需要连接后端API
2. 登录功能为演示版本，实际项目需要完善认证逻辑
3. 项目严格按照参考文档的架构和样式实现
4. 支持菜单折叠、三级路由等高级功能
