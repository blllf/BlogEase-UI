import request from '../utils/request.js'

export const receiveMsg = (userId) => {
    return request.get('/message/receiveMsg?userId=' + userId)
}

export const showMsgListService = (params) => {
    return request.get('/message/showMsgList' , {params:params} )
}

export const deleteMsgByIdsService = (params) => {
    return request.post('/message/deleteMsgByIds' , JSON.stringify(params), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
