import axios from 'axios'

const  httpInstance = axios.create({
    baseURL:'http://localhost:9999/api',
    timeout:5000
});

//增加请求拦截器
httpInstance.interceptors.request.use(config => {
    return config;
}, e => Promise.reject(e));


//增加响应拦截器
httpInstance.interceptors.response.use(res=>res.data, e=>{
    return Promise.reject(e)
});

export default httpInstance;
