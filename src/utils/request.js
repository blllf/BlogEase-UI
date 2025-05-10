//定制请求的实例

import router from '../router/indexs.js'

//导入axios  npm install axios
import axios from 'axios';
import { ElMessage } from 'element-plus'
//定义一个变量,记录公共的前缀  ,  baseURL
//const baseURL = 'http://localhost:8080';
//此时会把axios所在的源拼上去  相当于 http://localhost:8080/api
const baseURL = '/api';
const instance = axios.create({baseURL})

import {useTokenStore} from '../stores/token.js'
//添加请求拦截器
instance.interceptors.request.use(
    (config) => {
        //请求前的回调
        //添加token
        const takeToken = useTokenStore();
        if (takeToken.token){
            config.headers.Authorization = takeToken.token
            //console.log('request: '+takeToken.token)
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error)
    }
)


//添加响应拦截器
instance.interceptors.response.use(
    result=>{
        if (result.data.code === 0){
            return result.data;
        }
        // 检查标志
        if (!result.config.headers['category_add']) {
            ElMessage.error(result.data.message ? result.data.message : '服务异常');
        }
        //ElMessage.error('服务异常')
        //异步操作的状态转换为失败 会抛出一个被拒绝的 Promise 使用 try...catch 语句来捕获这个错误
        return Promise.reject(result.data);
    },
    //没有通过响应请求
    err=>{
        //如果是401 ，则未登录
        if (err.response.status === 401){
            ElMessage.error('请先登录');
            router.push('/login')
        }else {
            ElMessage.error('服务异常')
        }
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;