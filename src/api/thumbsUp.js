import request from "../utils/request.js";

//从redis 中查询 点赞数据
export const findLikeCountService = (articleId) => {
    return request.get('/thumbsUp/findLikeCountRedis?articleId=' + articleId)
}

export const incrementCountService = (articleId) => {
    return request.get('/thumbsUp/incrementCount?articleId=' + articleId)
}

export const decrementCountService = (articleId) => {
    return request.get('/thumbsUp/decrementCount?articleId=' + articleId)
}