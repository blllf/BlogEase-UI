<script lang="ts" setup>
import {
  Orange,Finished, Grid, Folder, Tickets, Management, Promotion, UserFilled, User, Crop, EditPen, SwitchButton,
  CaretBottom,Close,View,House
} from '@element-plus/icons-vue'
//头像
import avatar from '../../assets/default.png'
import {ref , watch , onMounted} from "vue";
//调用函数获取用户的详细信息
import {userInfoService} from '../../api/user'
import {userInfoStore} from '../../stores/userInfo'
import {useTokenStore} from '../../stores/token'
import { useRoute, useRouter  } from 'vue-router';
import router from '../../router/indexs'
import {ElMessage, ElMessageBox} from "element-plus";

const route = useRoute();// 获取当前路由对象
const userRouter = useRouter();
const tokenStore = useTokenStore();
const infoStore = userInfoStore();

// 在原有import基础上新增
type VisitedRoute = {
  path: string;
  name?: string;
  title?: string;
};
// 标签数组
const visitedRoutes = ref<VisitedRoute[]>([]);
// 添加路由到标签
const addTag = (route: any) => {
  const exists = visitedRoutes.value.some(item => item.path === route.path);
  if (!exists && route.meta?.showTag !== false) { // 假设你可以在路由meta中设置showTag控制是否显示
    visitedRoutes.value.push({
      path: route.path,
      name: route.name,
      title: route.meta?.title || route.name
    });
  }
};

const getUserInfo = async () => {
  const result = await userInfoService();
  //数据存储到pinia中
  infoStore.setInfo(result.data)
}

onMounted(() => {
  getUserInfo()
})




//条目被点击后，调用的函数
const handleCommand = (command) => {
  if (command === 'logout'){
    //退出登录
    ElMessageBox.confirm(
        '你确认要退出吗',
        '温馨提示',
        {confirmButtonText : '确认', cancelButtonText : '取消', type:'warning'}
    ).then(async () => {
          //清空pinia 中存储的token以及个人信息
          tokenStore.removeToken()
          infoStore.removeInfo()
          //跳转到登录界面
          router.push('/login')
          ElMessage({type: 'success', message: '退出成功',})
        }).catch(() => {ElMessage({type: 'info', message: '用户取消了退出',})
        })}else {router.push('/user/' + command )
  }
}

const activeIndex = ref('');
// 监听路由变化，动态更新 activeIndex
watch(
    () => route.path,
    (newPath) => {
      addTag(route);
      activeIndex.value = newPath; // 将当前路由路径赋值给 activeIndex
    },
    { immediate: true } // 立即执行一次，确保页面加载时也生效
);

// 关闭标签
const closeTag = (path: string) => {
  const index = visitedRoutes.value.findIndex(item => item.path === path);
  if (Index !== -1) {
    visitedRoutes.value.splice(Index, 1);
    // 如果关闭的是当前激活标签，跳转到最后一个标签
    if (path === route.path) {
      const lastRoute = visitedRoutes.value[visitedRoutes.value.length - 1];
      if (lastRoute) {
        userRouter.push(lastRoute.path);
      } else {
        userRouter.push('/article/category');
      }
    }
  }
};

// 关闭其他标签
/*const closeOthers = (currentPath: string) => {
  visitedRoutes.value = visitedRoutes.value.filter(
      item => item.path === currentPath || item.path === '/'
  );
};*/
</script>


<template>

  <el-container class="layout-container">

    <el-aside width="200px">
      <div class="el-aside_mulu" style="color: #f9f9f9;letter-spacing: 4px">
       <p style="font-size: 25px">后台管理</p>
      </div>
      <div class="el-aside__logos"></div>
        <el-menu
            :default-active="activeIndex"
            active-text-color="#ffd04b"
            background-color="#232323"
            text-color="#fff"
            router
        >
          <el-menu-item index="/homepage/info">
            <el-icon><House /></el-icon>
            <span>主页信息</span>
          </el-menu-item>

          <el-menu-item index="/article/category">
            <el-icon><Grid /></el-icon>
            <span>数据分析</span>
          </el-menu-item>

          <el-menu-item index="/article/square">
            <el-icon><Orange /></el-icon>
            <span>文章管理</span>
          </el-menu-item>

          <el-sub-menu index="1">
            <template #title>
              <el-icon><Management /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/user/usersManage">
              <el-icon><Tickets /></el-icon>
              <span>人员管理</span>
            </el-menu-item>
            <el-menu-item index="/article/articlesAudit">
              <el-icon><Finished /></el-icon>
              <span>文章审核</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="2">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              <span>个人中心</span>
            </template>
            <el-menu-item index="/user/index">
              <el-icon> <User/> </el-icon>
              <span>个人信息</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/homepage/systemMetrics">
            <el-icon><View /></el-icon>
            <span>系统指标</span>
          </el-menu-item>

          <el-menu-item index="/headend/index">
            <el-icon><Tickets /></el-icon>
            <span>前台</span>
          </el-menu-item>

        </el-menu>

    </el-aside>



    <!-- 右侧主区域 -->
    <el-container style="background-color: #f5f7fa">
      <!-- 头部区域 -->
      <el-header>
        <div>用户：<strong>{{infoStore.info.nickname}}</strong></div>
        <el-dropdown placement="bottom-end" @command="handleCommand">
                    <span class="el-dropdown__box">
                       <el-avatar :src="infoStore.info.userPic?infoStore.info.userPic:avatar" />
                        <el-icon>
                            <CaretBottom />
                        </el-icon>
                    </span>
          <template #dropdown>
          <!-- command:条目被点击后会触发,在事件函数上可以声明一个参数,接收条目对应的指令-->
            <el-dropdown-menu>
              <el-dropdown-item command="index" :icon="User">个人信息</el-dropdown-item>
              <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <!-- 新增标签导航区域 -->
      <div class="tags-container">
        <div class="tags-wrapper">
          <div
              v-for="tag in visitedRoutes"
              :key="tag.path"
              class="tag-item"
              :class="{ 'active': activeIndex === tag.path }"
          >
            <span class="tag-name" @click="router.push(tag.path)">{{ tag.title }}</span>
            <el-icon
                class="close-icon"
                @click="closeTag(tag.path)"
                v-if="tag.path !== '/'"
            >
              <Close />
            </el-icon>
          </div>
        </div>
      </div>


      <!-- 中间区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
      <!-- 底部区域 -->
      <el-footer>创作与交流平台 ©2025 Created by blllf</el-footer>

    </el-container>



  </el-container>


</template>


<style lang="scss" scoped>
.el-aside_mulu {
  display: flex;
  margin-top: 20px;
  margin-left: 40px;
}

.layout-container {
  height: 100vh;
  .el-aside {
    background-color: #232323;
    // 列表边框
    .el-menu {
     // margin-top: 40px;
      border-right: none;
    }
  }

  .el-header {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .el-dropdown__box {
      display: flex;
      align-items: center;

      .el-icon {
        color: #999;
        margin-left: 10px;
      }

      &:active,
      &:focus {
        outline: none;
      }
    }
  }

  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
  }
}

.tags-container {
  margin-top: 5px;
  margin-bottom: 10px;
  height: 35px;
  background-color: #f5f7fa;
  border-bottom: 1px  #d8dce5;
  //box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12);
  padding: 0 20px;
  .tags-wrapper {
    display: flex;
    overflow-x: auto;
    .tag-item {
      height: 32px;
      line-height: 32px;
      border: 1px solid #d8dce5; // 添加灰色边框
      //color: #495060;
      background: #fff;
      padding: 0 8px;
      margin: 4px 4px 0;
      border-radius: 5px;
      display: flex;
      align-items: center;
      transition: all 0.3s;

      &:hover {
        background-color: #a0cfff; // 鼠标悬停时的背景颜色
        border-color: #a0cfff; // 鼠标悬停时的边框颜色
      }

      &.active {
        background-color: #409eff;
        border-color: #409eff;
        color: #fff;

        .close-icon {
          color: #fff;
        }
      }

      .tag-name {
        cursor: pointer;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .close-icon {
        margin-left: 6px;
        font-size: 15px;
        cursor: pointer;
        color: #666;

        &:hover {
          color: #333;
        }
      }
    }
  }
}
</style>

