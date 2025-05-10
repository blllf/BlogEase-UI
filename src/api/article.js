import request from '../utils/request.js'
import {useTokenStore} from '../stores/token.js'

//文章分类列表查询
export const articleCategoryListService = () => {
    //const tokenStore = useTokenStore();
    //在pinia中定义的响应式数据,都不需要.value
    //return request.get('/category',{headers:{Authorization:tokenStore.token}})
    return request.get('/category')
}

//查询所有的分类
export const articleCategoryListService2 = () => {
    return request.get('/category/all')
}

//文章分类添加接口
export const addCategoryService = (categoryData) => {
    return request.post('/category',categoryData)
}

export const updateCategoryService = (categoryData) => {
    return request.put('/category' , categoryData)
}

export const deleteCategoryService = (id) => {
    return request.delete('/category?id=' + id)
}

//文章列表查询
//{params:params} 参数较多的情况使用
export const articleListSelectService = (params) => {
    return request.get('/article', {params:params})
}

//查询所有文章
export const selectAllService = (params) => {
    return request.get('/article/selectAll' , {params:params})
}

//发布文章
export const articleAddService = (articleData) => {
    return request.post('article' , articleData)
}
//admin发布文章
export const adminAddArticleService = (articleData) => {
    return request.post('/article/admin/add' , articleData)
}

//修改文章内容
export const updateArticleService = (articleData) => {
    return request.put('article' , articleData)
}

//删除文章
export const deleteArticleService = (id) => {
    return request.delete('article?id=' + id)
}

//查看文章内容
export const readArticleService = (id) => {
    return request.get('/article/detail?id=' + id)
}

//
export const selectArticleByCategoryService = () => {
    return request.get('/article/selectArticleByCategory')
}

//查询收藏文章
/*export const selectArticleByUserIdService = () => {
    return request.post('/article/selectForCollection')
}*/
export const selectArticleByUserIdService = (uid) => {
    return request.get('/article/selectForCollection?uid=' + uid)
}
//收藏文章
export const addArticleILikeService = (articleId) => {
    return request.get("/article/addArticleILike?articleId=" + articleId)
}

//删除收藏文章
export const deleteArticleByIdService = (articleId) => {
    return request.get("/article/deleteArticleById?articleId=" + articleId)
}
//批量删除文章
export const deleteByIdsService = (params) => {
    return request.post("/article/deleteByIds", JSON.stringify(params), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

//主页搜索
export const selectAllArticles = (params) => {
    return request.get('/article/showPageArticle', {params:params})
}

export const indexSearch = (params) => {
    return request.post('/article/indexSearch', params)
}

//推荐
export const selectAllArticles2 = (params) => {
    return request.post('/article/showRecommendArticle' , params)
}

//头条
export const hotSearchService2 = (params) => {
    return request.post('/article/hotSearch2', params)
}

//热点
export const hotPotFindService = (params) => {
    return request.post('/article/hotpotFind' , params)
}

//分类搜索
export const findArticlesByPageService = (params) => {
    return request.get('/article/findArticlesByPage' , {params:params})
}

//阅读文章
export const selectById = (id) => {
    return request.get('/article/id?id=' + id)
}


//根据分类Name查找对应文章
export const findAllArticlesByCNService = (params) => {
    return request.post('/article/categoryName' , params)
}


//热门分类前五
export const select5Service = () => {
    return request.get('/category/select5')
}

//根据文章的分类Id查询分类名称
export const selectCateByArtIdService = (articleId) => {
    return request.get('/category/selectCateByArtId?id=' + articleId)
}

export const findCategoryNameService = (categoryId) => {
    return request.get('/category/findCategoryName?id=' + categoryId)
}

//管理员审核文章
export const articlesAuditService = (params) => {
    return request.get('/article/articlesAudit' , {params:params})
}

//管理员 是否通过
export const isPassService = (params) => {
    return request.get('/article/passOrNoPass' , {params: params})
}


//主页消息 查询本人文章 审核中与审核不通过
export const findWaitingOrNoPassService = (id) => {
    return request.get('/article/message?label=' + id)
}

//各个总数量
export const findCAndUAndAService = () => {
    return request.get('/article/findCount')
}

//照片墙 添加图片
export const addPictureService = (params) => {
    return request.post('/picture/add', params)
}

//获取图片
export const findPicturesService = (uid) => {
    return request.get('/picture/findAll?uid=' + uid)
}

//删除图片
export const deletePictureByIdService = (id) => {
    return request.delete('/picture/deleteById?id=' + id)
}

//数量以及排名
export const selectNumAndRankService = (uid) => {
    return request.get('/article/numAndRank?uid=' + uid)
}

//热文榜
export const hotEssayListService = (number) => {
    return request.get('/article/hotEssayList?number=' + number)
}

//个人中心-文章
export const findPersonalCenterEssay = (params) => {
    return request.post('/article/personalCenterEssay' , params)
}

//系统数据监控
export const getMetricsData = () => {
    return request.get('/system/metrics')
}







