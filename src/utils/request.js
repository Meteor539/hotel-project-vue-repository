import axios from 'axios'

// 分店服务HTTP实例（端口4000）
const httpInstance = axios.create({
    baseURL:'/api',
    timeout:5000
});

// 房间服务HTTP实例（端口5000）
const roomHttpInstance = axios.create({
    baseURL:'/room-api',
    timeout:5000
});

// 用户服务HTTP实例（端口3000）- 根据AuthAPI文档
const userHttpInstance = axios.create({
    baseURL:'/user-api',
    timeout:5000
});

//增加请求拦截器 - 分店服务
httpInstance.interceptors.request.use(config => {
    // 添加Token到请求头
    const token = localStorage.getItem('hotel_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, e => Promise.reject(e));

//增加请求拦截器 - 房间服务
roomHttpInstance.interceptors.request.use(config => {
    // 添加Token到请求头
    const token = localStorage.getItem('hotel_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, e => Promise.reject(e));

//增加请求拦截器 - 用户服务
userHttpInstance.interceptors.request.use(config => {
    // 登录接口不需要添加Token
    if (config.url !== 'auth/rbac/login') {
        // 添加Token到请求头
        const token = localStorage.getItem('hotel_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, e => Promise.reject(e));

//增加响应拦截器 - 分店服务
httpInstance.interceptors.response.use(
    res => res.data,
    e => {
        console.error('分店服务请求错误:', e);
        // 处理Token过期
        if (e.response && e.response.status === 401) {
            // 清除本地存储的用户信息
            localStorage.removeItem('hotel_token');
            localStorage.removeItem('hotel_user');
            localStorage.removeItem('hotel_permissions');
            // 跳转到登录页面
            window.location.href = '/login';
        }
        return Promise.reject(e);
    }
);

//增加响应拦截器 - 房间服务
roomHttpInstance.interceptors.response.use(
    res => res.data,
    e => {
        console.error('房间服务请求错误:', e);
        // 处理Token过期
        if (e.response && e.response.status === 401) {
            // 清除本地存储的用户信息
            localStorage.removeItem('hotel_token');
            localStorage.removeItem('hotel_user');
            localStorage.removeItem('hotel_permissions');
            // 跳转到登录页面
            window.location.href = '/login';
        }
        return Promise.reject(e);
    }
);

//增加响应拦截器 - 用户服务
userHttpInstance.interceptors.response.use(
    res => res.data,
    e => {
        console.error('用户服务请求错误:', e);
        // 处理Token过期
        if (e.response && e.response.status === 401) {
            // 清除本地存储的用户信息
            localStorage.removeItem('hotel_token');
            localStorage.removeItem('hotel_user');
            localStorage.removeItem('hotel_permissions');
            // 跳转到登录页面
            window.location.href = '/login';
        }
        return Promise.reject(e);
    }
);

export default httpInstance;
export { roomHttpInstance, userHttpInstance };
