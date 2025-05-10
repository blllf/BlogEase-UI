import { createRouter , createWebHistory} from 'vue-router'

//导入组件
import LoginVue from '../views/Login.vue'
import NavigationVue from '../views/admin/Navigation.vue'
import UserInfoVue from '../views/user/UserInfo.vue'
import UserAvatarVue from '../views/user/UserAvatar.vue'
import UserResetPasswordVue from '../views/user/UserResetPassword.vue'
import ArticleSquareVue from '../views/article/ArticleSquare.vue'
import ArticleCategoryVue from '../views/article/ArticleCategory.vue'
import forgetPwdVue from '../views/forgetPassword.vue'
import ReadTheArticleVue from "@/views/headend/ReadTheArticle.vue";
import articleIndexVue from '../views/headend/homepage/articleIndex.vue'
import ILikeArticlesVue from '../views/headend/myArticle/ILikeArticles.vue'
import IArticlesVue from '../views/headend/myArticle/MyArticles.vue'
import UsersManageVue from '../views/user/UsersManage.vue'
import ArticlesAudit from '../views/article/ArticlesAudit.vue'
import UserMessage from '../views/headend/UserMessage.vue'
import PeopleCentral from '../views/headend/myArticle/PeopleCentral.vue'
import Picture from '../views/headend/myArticle/Picture.vue'
import UserIndexVue from '../views/user/index.vue'
import CategoryLabelsVue from '../views/headend/homepage/Categorylabels.vue'
import EsPageVue from '../views/headend/homepage/Espage.vue'
import CreateArticleVue from "../views/headend/myArticle/CreateArticle.vue";
import ArticlesCategoryVue from "@/views/headend/ArticlesCategory.vue";
import HomePageVue from "@/views/admin/HomePage.vue";
import SystemMetricsVue from "@/views/admin/SystemMetrics.vue";
import ResourceVue from "@/views/headend/myArticle/Resource.vue";
import MessagesVue from "@/views/headend/Messages.vue";
//定义路由关系
//还需要定义子路由
const routers = [
    { path: '/login' , component: LoginVue},
    { path: '/forgetPwd' , component: forgetPwdVue},
    { path: '/my_blog/creation/:id' , name: 'EditArticle' , component: CreateArticleVue},
    { path: '/my_blog/creation' , name: 'CreateArticle' , component: CreateArticleVue},
    { path: '/' , redirect: '/login' },
    { path: '/headend/index' ,redirect:'/article/index' , component: articleIndexVue , children:[
            {path: '/article/espage' , name: 'EsPage' , component: EsPageVue},
            {path: '/article/index' , component: CategoryLabelsVue},
            {path: '/article/message' , component: UserMessage},
            {path: '/article/testmessage' , component: MessagesVue},
            {path: '/article/category/:id' , component: ArticlesCategoryVue},
            {path: '/article/peopleCentral' ,  component: PeopleCentral },
            {path: '/article/resource' , component: ResourceVue},
            {path: '/article/ilikearticles' , component: ILikeArticlesVue },
            {path: '/article/myarticles' , component: IArticlesVue},
            {path: '/article/picture', component: Picture},
            {path: '/article/details/:id' , component: ReadTheArticleVue}
        ]},
    { path: '/homepage' , component: NavigationVue ,redirect:'/homepage/info',  meta: { showTag: true }, // 后台入口不需要标签
        children:[
            {path:'/user/info' , component: UserInfoVue},
            {path:'/user/avatar' , component: UserAvatarVue},
            {path:'/user/resetPassword' , component: UserResetPasswordVue},
            {path:'/homepage/info' , component: HomePageVue , meta: { title: '主页信息', showTag: true}},
            {path:'/user/index' , component: UserIndexVue , meta: { title: '个人信息', showTag: true}},
            {path: '/article/square' , component: ArticleSquareVue ,  meta: { title: '站内文章', showTag: true}},
            {path:'/article/category' , component: ArticleCategoryVue ,  meta: { title: '文章分类', showTag: true}},
            {path:'/user/usersManage' , component: UsersManageVue,  meta: { title: '人员管理', showTag: true}},
            {path:'/article/articlesAudit' , component: ArticlesAudit, meta: { title: '文章审核', showTag: true}},
            {path:'/homepage/systemMetrics' , component: SystemMetricsVue, meta: { title: '系统指标', showTag: true}},
        ]}
]

//创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes:routers
})

//导出路由
export default router
