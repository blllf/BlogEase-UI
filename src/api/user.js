//导入request.js 请求工具
import request from '../utils/request.js'
import {useTokenStore} from '../stores/token.js'

//提供调用注册接口的函数
export const userRegisterService = (registerData) => {
    //借助于URLSearchParams完成传递
    //创建一个用于处理 URL 查询参数的对象，以便于在 JavaScript 中方便地操作和处理 URL 查询参数。
    const params = new URLSearchParams();
    for (let key in registerData){
        params.append(key,registerData[key]);
    }
    return request.post('/user/register',params);
}

//提供调用登录接口的函数
export const userLoginService = (loginData) => {
    const params = new URLSearchParams();
    for (let key in loginData){
        params.append(key,loginData[key]);
    }
    return request.post('/user/login',params);
}

export const userInfoService = () => {
    return request.get('/user/userInfo')
}

export const peopleInfoService = (id) => {
    return request.get('/user/peopleInfo?id=' + id)
}

//修改用户的信息
export const updateUserService = (userData) => {
    return request.put('/user/update' , userData)
}

//修改图片
export const updateAvatarService = (url) => {
    return request.patch('/user/updateAvatar?avatarUrl=' + url)
}

/*import {useTokenStore} from '../stores/token.js'
const tokenStore = useTokenStore()*/
export const updatePasswordService = (params) => {
    //const tokenStore = useTokenStore()
    return request.patch('/user/updatePassword',params /*, {headers:{Authorization:tokenStore.token}}*/ )
}

//发送邮件
export const sendEmailService = (email) => {
    return request.get('/user/sendEmail?email=' + email)
}

//找回密码
export const findPasswordService = (params) => {
    return request.patch('/user/findPwd' , params)
}

//查询所有用户
export const selectAllUsersService = () => {
    return request.get('/user/selectAllusers')
}

//管理员
//分页查询所有用户的信息
export const selectAllUsersByAdminService = (params) => {
    return request.get('/user/getEveryOne' , {params:params})
}

//管理员
export const selectByIdService = (id) => {
    return request.get('user/getOne?id=' + id)
}

//后端 管理员 删除用户
export const deleteUserByAdminService = (userId) => {
    return request.delete('/user/deleteUser?id=' + userId)
}

export const updateUserAdminService = (userData) => {
    return request.post('/user/updateUserAdmin' , userData)
}

//添加用户
export const addUserAdminService = (userData) => {
    return request.post('/user/addUserAdmin' , userData)
}

//导出数据
//采用重定位
/*export const exportUserDataService = () => {
    //return request.post('/fileExport' , { fileName: 'abc' } ,{ responseType: 'blob' })
    return request.get('/user/fileExport?fileName=abc',{ responseType: 'blob'  })
}*/

//top10
export const findUAService = () => {
    return request.get('/user/findUA')
}

export const updateEmailOrNickService = (params) => {
    return request.get('/user/updateEmailOrNick' , {params:params} )
}


export const findRankService = () => {
    return request.get('/user/findRank')
}

//cookie
export const usernameFromToken = (rememberMeToken) => {
    return request.post('/user/validateRememberMe' , {rememberMe: rememberMeToken} , {withCredentials: true})
}


//关注
export const attentionService = (params) => {
    return request.get('/user/follow' , {params:params} )
}
export const unAttentionService = (params) => {
    return request.get('/user/unfollow' , {params:params})
}
export const existsFollowService = (params) => {
    return request.get('/user/existsFollow' , {params:params} )
}
export const getFollowerCountService = (userId) => {
    return request.get('/user/getFollowerCount?userId=' + userId);

}
export const findUserAttention = (userId) => {
    return request.get('/user/findUserAttention?userId=' + userId)
}



