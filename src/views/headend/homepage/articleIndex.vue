<script setup>
import {onMounted, ref , computed,watch  } from "vue";
import {articleCategoryListService2} from "@/api/article.js";
import avatar from "@/assets/default.png";

//调用函数获取用户的详细信息
import {userInfoService} from '../../../api/user.js'
import {userInfoStore} from '../../../stores/userInfo.js'
import {useTokenStore} from '../../../stores/token.js'
import {ElMessage, ElMessageBox} from "element-plus";
/*import router from "@/router/indexs.js";*/
import {findWaitingOrNoPassService} from '../../../api/article.js'
import { useRoute , useRouter  } from 'vue-router';

const tokenStore = useTokenStore();
const infoStore = userInfoStore();
const messageNum = ref(0)
const activeIndex2 = ref('1')

//处理数据用 文章分类数据模型
const categorys = ref([
  {
    id: 3,
    categoryName: '美食',
    categoryAlias: 'my',
    createTime: '2023-09-02 12:06:59',
    updateTime: '2023-09-02 12:06:59'
  },
])

onMounted(() => {
  getUserInfo();
  articleCategoryList()
})

const getUserInfo = async () => {
  const result = await userInfoService();
  //数据存储到pinia中
  infoStore.setInfo(result.data)
}




const articleCategoryList = async () => {
  const result = await articleCategoryListService2();
  categorys.value = result.data;

  //记录没有通过审核的条目数
  const resultNoPass = await findWaitingOrNoPassService(3);
  for (let i = 0; i < resultNoPass.data.length; i++) {
    if (resultNoPass.data[i].deleted === 3){
      messageNum.value = messageNum.value + 1;
    }
  }

  /*infoStore.setMessageNum(messageNum.value)
  console.log("hahahah " + infoStore.messageNum)*/
}




//新样式
// 定义响应式数据
const activeIndex = ref('/article/index'); // 默认激活的菜单项
const searchQuery = ref('');  // 搜索框绑定的数据
const categoryId = ref('') // 根据类别搜索
const dateTime = ref('default') //搜索时间范围

// 定义方法
const handleSelect = (key, keyPath) => {
  console.log(key, keyPath);
};

const handleSearch = () => {
  /*router.push({
    path: '/article/espage',
    query: {q: searchQuery.value , c: categoryId.value}
  })*/
  // 解析路径并获取完整URL
  const resolved = router.resolve({
    path: '/article/espage',
    query: { q: searchQuery.value, c: categoryId.value , date: dateTime.value }
  });
  // 使用window.open在新标签页中打开链接
  window.open(resolved.href, '_blank');

};

const createArticle = () => {
  const newPageUrl = window.location.origin + '/my_blog/creation'; // 获取当前站点的完整URL加上目标路径
  window.open(newPageUrl, '_blank'); // 在新标签页打开链接
  console.log("创作文章");
}

//退出
const logout = () => {
  ElMessageBox.confirm(
      '您确定要退出登录吗?',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    // 执行退出逻辑，清除token、重定向到登录页等
    tokenStore.removeToken()
    infoStore.removeInfo()
    //跳转到登录界面
    router.push('/login')
    ElMessage({
      type: 'success',
      message: '退出成功.',
    });
    // 这里可以添加实际的退出逻辑，例如调用API进行登出操作
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消退出',
    });
  });
};

// 点击搜索后跳转到另一个页面不显示该搜索框
// 获取当前路由对象
const route = useRoute();
const router = useRouter();
// 根据路由名称决定是否显示搜索组件
const showSearch = computed(() => {
  //console.log("route" , route.name)
  // 如果当前路由名称不是 Espage，则显示搜索组件
  return route.name !== 'EsPage'; // 假设 Espage 的路由名称为 'Espage'
});


const goToPeopleCentral = () => {
  router.push({
    path: '/article/peopleCentral',
    query: {p: infoStore.info.username , id: infoStore.info.id}
  })
 /* const resolved = router.resolve({
    path: '/article/peopleCentral',
    query: {p: infoStore.info.username , id: infoStore.info.id}
  });
  // 使用window.open在新标签页中打开链接
  window.open(resolved.href, '_blank');*/
};

// 监听路由变化，更新 activeIndex
watch(
    () => route.path,
    (newPath) => {
      activeIndex.value = newPath;
    }
);

</script>

<template>
  <el-affix>
    <header class="csdn-header">
      <!-- Logo -->
      <div class="logo">
        <router-link to="/">
          <img src="../../../../public/pineapple.png" alt="CSDN Logo" />
        </router-link>
      </div>
      <!-- 菜单项 -->
      <el-menu :default-active="activeIndex" class="nav-menu" mode="horizontal" router>
        <el-menu-item index="/article/index">首页</el-menu-item>
        <el-menu-item index="/article/message">消息</el-menu-item>
<!--        <el-menu-item index="/article/testmessage">测试消息</el-menu-item>-->
        <el-menu-item index="/article/peopleCentral" @click="goToPeopleCentral">个人中心</el-menu-item>
        <el-menu-item v-if="infoStore.info.username === 'admin' " index="/homepage">后台管理</el-menu-item>
      </el-menu>

      <!-- 原生搜索框 -->
      <div v-if="showSearch" class="search-container">
        <input
            type="text"
            placeholder="搜索..."
            v-model="searchQuery"
            class="search-input"
            @keyup.enter="handleSearch"
        />
        <button class="search-button" @click="handleSearch">
          <!--        <i class="el-icon-search"></i>--> <!-- 使用 Element Plus 图标 -->
          搜索
        </button>
      </div>

      <!-- 用户交互区域 -->
      <div class="user-actions">
        <el-popover
            placement="bottom"
            :width="210"
            trigger="hover">
          <template #default>
            用户名: <strong>{{infoStore.info.nickname}}</strong>
            <p>邮箱: {{infoStore.info.email}}</p>
            <el-button size="mini" type="text" @click="logout">退出登录</el-button>
          </template>
          <template #reference>
            <el-avatar :src="infoStore.info.userPic?infoStore.info.userPic:avatar"></el-avatar>
          </template>
        </el-popover>
      </div>
      <div>
        <button class="create-button" @click="createArticle">
          +创作
        </button>
      </div>
    </header>
  </el-affix>
  <!-- 新样式 -->


  <div>
    <router-view></router-view>
  </div>


</template>

<style scoped>
.csdn-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
}

.logo img {
  height: 40px;
}

.nav-menu {
  flex-grow: 1;
  margin-left: 2rem;
  border-bottom: none; /* 移除默认的下边框 */
}


.search-container {
  display: flex;
  align-items: center;
  margin-left: auto;
  margin-right: 1rem;
  width: fit-content; /* 让容器宽度适应内容 */
}

.search-input {
  width: 400px; /* 设置固定宽度 */
  height: 32px;
  padding: 0 10px;
  font-size: 14px;
  line-height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 24px 0 0 24px; /* 只对左边进行圆角处理 */
  outline: none;
  transition: all 0.3s ease-in-out;
}

.search-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 5px rgba(64, 158, 255, 0.5);
}

.search-button {
  height: 32px;
  width: 80px;
  padding: 0 10px;
  background: #409eff;
  border: none;
  color: white;
  font-size: 16px;
  border-radius: 0 24px 24px 0; /* 只对右边进行圆角处理 */
  cursor: pointer;
  transition: background-color 0.3s ease-in-out; /* 确保背景颜色变化有过渡效果 */
}
.search-button:hover,
.search-button:focus {
  background-color: #367bd4; /* 指定一个更深但仍然明亮的颜色 */
}

.create-button {
  margin-left: 20px;
  height: 32px;
  width: 130px;
  background: #409eff;
  border: none;
  color: white;
  font-size: 16px;
  border-radius: 24px 24px 24px 24px; /* 只对右边进行圆角处理 */
  cursor: pointer;
  transition: background-color 0.3s ease-in-out; /* 确保背景颜色变化有过渡效果 */
}
.create-button:hover,
.create-button:focus {
  background-color: #367bd4; /* 指定一个更深但仍然明亮的颜色 */
}

.user-actions {
  display: flex;
  align-items: center;
}

.user-actions .el-button {
  margin-right: 0.5rem;
}




</style>