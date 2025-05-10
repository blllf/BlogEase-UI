<script setup>
import {onMounted, ref} from "vue";
import {ArrowLeftBold, ArrowRightBold, Loading} from "@element-plus/icons-vue";
import {hotSearchService2 , hotPotFindService} from "../../../api/article.js";
import {truncateContent,truncateTitle} from '../../../api/genericFunctions.js'
const article = ref([
  {
    id: 3,
    title: '河南一日游',
    content: '',
    coverImg: '',
    state: '草稿',
    categoryId: 2,
    createUser:'白龙飞',
    createTime:'',
    updateTime:'',
    categoryPic: ''
  }
]);
const articleTop = ref(null)
const isInitialized = ref(false) // 新增标记位
const hotPotArticle = ref([
  {
    articlePic: '/src/assets/pic/ali2.jpg',
    title: '热门标题1热门标题1热门标题1热门...',
    content: '为人民服务'
  }
]);
// 定义自定义事件
const emit = defineEmits(["loaded"]);
// left分页状态
const currentPage = ref(0);
const itemsPerPage = ref(6); // 每页显示的文章数量
// right分页状态
const currentPageRight = ref(0);
const itemsPerPageRight = ref(5);
const loading = ref(true); // 加载状态，默认为 true

const totalPages = ref(20); //总页数
const totalItems = ref(0); //总文章数量
//头条
const selectAll = async (pageNum, pageSize) => {
  try {
    loading.value = true; // 开始加载
    const params = {
      page: pageNum,
      size: pageSize,
    };
    currentPage.value = pageNum;
    const result = await hotSearchService2(params); // 调用接口
    article.value = result.data; // 更新文章数据
    // 检查 articleTop 是否已分配，如果没有，则分配
    if (!isInitialized.value && article.value.length > 0) {
      articleTop.value = article.value[0];
      isInitialized.value = true; // 标记为已初始化
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
  } finally {
    loading.value = false; // 数据加载完成，关闭加载状态
    emit("loaded");
  }
};

//热点
const hotpotFind = async (pageNum, pageSize) => {
  let params = {
    page: pageNum,
    size: pageSize
  }
  currentPageRight.value = pageNum;
  const result = await hotPotFindService(params);
  hotPotArticle.value = result.data
}

onMounted(() => {
  selectAll(currentPage.value, itemsPerPage.value); // 组件挂载时获取分类数据
  hotpotFind(currentPageRight.value, itemsPerPageRight.value)
});

// 上一页
const prevPage = (position) => {
  if (position === 'left' && (currentPage.value > 1)) {
    currentPage.value -= 5;
    selectAll(currentPage.value , itemsPerPage.value)
    console.log('left 上一页：' + currentPage.value)
  }
  if (position === 'right' && (currentPageRight.value > 1)){
    currentPageRight.value -= 5;
    hotpotFind(currentPageRight.value , itemsPerPageRight.value)
    console.log('right' , + currentPageRight.value)
  }
};

// 下一页
const nextPage = (position) => {
  if (position === 'left' && (currentPage.value < totalPages.value)) {
    //起始位置
    currentPage.value += 5;
    selectAll(currentPage.value, itemsPerPage.value)
    console.log("下一页", currentPage.value)
  }
  if (position === 'right' && (currentPageRight.value < totalPages.value)){
    currentPageRight.value += 5;
    hotpotFind(currentPageRight.value , itemsPerPageRight.value)
    console.log('right下' , currentPageRight.value )
  }
};

</script>

<template>
  <div class="article-container">
    <!-- 加载动画 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else class="article-grid">
      <!-- 左边栏 -->
      <div class="article-left"  v-if="articleTop">
        <h3 class="left-section-title">头条</h3>
        <img :src="articleTop.coverImg" alt="Article Image" class="article-image"/>
        <h2 class="left-article-title">
<!--          <router-link :to=" `/article/details/${article[0].id}` " class="router-link-headlines">{{truncateTitle(article[0].title , 20) }}</router-link>-->
          <a :href="(typeof window !== 'undefined' ? window.location.origin : '') + '/article/details/' + articleTop.id"
             target="_blank"
             class="router-link-headlines-middle">
<!--            {{ truncateTitle(article[0].title , 20) }}-->
            {{truncateTitle(articleTop.title , 20)}}
          </a>
        </h2>
        <p class="article-content" v-html="truncateContent(articleTop.content, 70)"></p>
      </div>
      <!-- 中间栏 -->
      <div class="article-columns middle-column">
<!--        <h2 class="section-title">中间部分</h2>-->
        <!-- 按钮容器 -->
        <div class="button-container">
          <el-button link @click="prevPage('left')" :disabled="currentPage === 0"><el-icon><ArrowLeftBold /></el-icon></el-button>
          <el-button link @click="nextPage('left')" :disabled="currentPage === totalPages"><el-icon><ArrowRightBold /></el-icon></el-button>
        </div>
        <div v-for="(item, index) in article.slice(1)" :key="index" class="article-item">
          <div class="middle-title">
<!--            <router-link :to=" `/article/${item.id}` " class="router-link-headlines-middle">{{ truncateTitle(item.title , 20)}}</router-link>-->
            <a :href="(typeof window !== 'undefined' ? window.location.origin : '') + '/article/details/' + item.id"
               target="_blank"
               class="router-link-headlines-middle">
              {{ truncateTitle(item.title, 25) }}
            </a>
          </div>
          <p class="article-content" v-html="truncateContent(item.content, 30)"></p>
        </div>
      </div>

      <!-- 右边栏 -->
      <div class="article-columns right-column">
        <h3 class="section-title">热点</h3>
        <div v-for="(item, index) in hotPotArticle" :key="index" class="article-item">
          <div class="middle-title">
<!--            <router-link :to=" `/article/${item.id}` " class="router-link-headlines-middle">{{ truncateTitle(item.title , 20)}}</router-link>-->
            <a :href="(typeof window !== 'undefined' ? window.location.origin : '') + '/article/details/' + item.id"
                target="_blank"
                class="router-link-headlines-middle">
              {{ truncateTitle(item.title, 25) }}
            </a>
          </div>
          <p class="article-content" v-html="truncateContent(item.content, 25)"></p>
        </div>
        <div class="button-container">
          <el-button link @click="prevPage('right')" :disabled="currentPageRight === 0"><el-icon><ArrowLeftBold /></el-icon></el-button>
          <el-button link @click="nextPage('right')" :disabled="currentPageRight === totalPages"><el-icon><ArrowRightBold /></el-icon></el-button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 16px;
  color: #666;
}
.loading-icon {
  font-size: 24px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.article-container {
  width: 80%; /* 设置容器宽度为页面的80% */
  margin: 0 auto; /* 确保容器居中 */
  padding: 20px;
}

.article-grid {
  display: grid;
  grid-template-columns: 370px 1fr 1fr; /* 固定左边栏宽度 */
  gap: 20px;
  align-items: start;
}

.section-title {
  font-size: 1.3em;
  color: #2c3e50;
  margin-bottom: 5px; /* 减少标题与内容之间的间距 */
}

.article-left {
  background-color: transparent;
  border: none;
  padding: 0;
}

.article-image {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
  transition: transform 0.3s ease; /* 添加过渡效果 */
}

.article-image:hover {
  transform: scale(1.05); /* 当鼠标悬停时放大图片 */
}

.left-article-title {
  font-size: 1.2em;

  margin-top: 2px;
  margin-bottom: 8px;
  font-weight: bold;
}

.middle-title {
  font-size: 1.1em;
  color: #2c3e50;
  margin-top: 6px;
  margin-bottom: 8px;
}

.article-title {
  font-size: 1.1em;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: normal;
}

.article-content {
  font-size: 1em;
  color: #7f8c8d;
  margin: 0;
}

.middle-column,
.right-column {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.article-item {
  margin-bottom: 16px;
}

/* 确保所有标题在同一水平线上 */
.article-grid > div {
  display: flex;
  flex-direction: column;
}

.left-section-title {
  margin-top: 0; /* 移除顶部外边距 */
}

.section-title {
  margin-top: 0; /* 移除顶部外边距 */
}

/* 确保中间栏与图片顶部对齐 */
.middle-column .section-title,
.right-column .section-title {
  margin-top: 0;
}

/* 减少整体留白 */
.article-grid {
  gap: 20px; /* 减少列之间的间距 */
}

/* 修改后的样式部分 */
.button-container {
  display: flex;
  justify-content: flex-end; /* 将内容靠右对齐 */
  margin-bottom: 10px; /* 与下面的文章列表保持一定距离 */
}

/* 移除单个按钮的左边距 */
.button-container .el-button {
  margin-left: 0;
  margin-right: 8px; /* 可选：为按钮之间添加间距 */
}

.router-link-headlines {
  color: #2c3e50;
  /* 确保链接不会换行 */
  white-space: nowrap;
  /* 设置过渡效果，使得颜色变化更加平滑 */
  transition: color 0.3s ease;
  text-decoration: none;
}

.router-link-headlines:hover {
  text-decoration: underline; /* 鼠标悬停时显示下划线 */
}
.router-link-headlines-middle {
  color: #000000;
  font-weight: normal;
  transition: color 0.3s ease;
  text-decoration: none;

}
.router-link-headlines-middle:hover {
  text-decoration: underline; /* 鼠标悬停时显示下划线 */
}
</style>