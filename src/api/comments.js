import request from '../utils/request.js'

export const addCommentService = (params) => {
    return request.post('/comment/addComment' ,  params)
}

//查询父级评论
export const selectAllByParentIdService = (params) =>{
    return request.get('/comment/selectAllByParentId', {params:params})
}

//查询所有评论
export const findAllCommentsService = (params) => {
    return request.get('/comment/findAllComments' , {params:params})
}

//删除评论
export const deleteCommentsService = (params) => {
    return request.get('/comment/deleteComments' , {params:params})
}

