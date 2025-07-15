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

//增加请求拦截器 - 分店服务
httpInstance.interceptors.request.use(config => {
    return config;
}, e => Promise.reject(e));

//增加请求拦截器 - 房间服务
roomHttpInstance.interceptors.request.use(config => {
    return config;
}, e => Promise.reject(e));

//增加响应拦截器 - 分店服务
httpInstance.interceptors.response.use(res=>res.data, e=>{
    return Promise.reject(e)
});

//增加响应拦截器 - 房间服务
roomHttpInstance.interceptors.response.use(res=>res.data, e=>{
    return Promise.reject(e)
});

export default httpInstance;
export { roomHttpInstance };
