<script setup>
import {ChatDotSquare} from "@element-plus/icons-vue";
import { ref, computed, onMounted, onUnmounted,watch } from 'vue';
import { useRoute , useRouter } from 'vue-router';
import {articleCategoryListService2,findAllArticlesByCNService} from '../../api/article.js'
import {truncateContent,formatTime} from '../../api/genericFunctions.js'
// 类别数据模型
const categories = ref([
  {
    id: 3,
    categoryName: '美食',
    categoryAlias: 'my',
    createTime: '2023-09-02 12:06:59',
    updateTime: '2023-09-02 12:06:59',
    categoryPic: '',
    createUser: ''
  }
]);
// 文章数据模型
const articleAndUser = ref([])

const currentCategory = ref('Java');
const loadSize = 5;
const currentPage = ref(1);
const isLoading = ref(false);
const route = useRoute();// 用于读取当前路由信息
const router = useRouter();
const urlParamName = ref(route.query.q || '')
// 新增状态
const hasMore = ref(true); // 是否还有更多数据

onMounted(async () => {
  urlParamName.value = route.query.paramName
  currentCategory.value = urlParamName.value
  const result = await articleCategoryListService2();
  categories.value = result.data
  await loadMoreArticles();
});


// 独立封装数据加载方法
const loadMoreArticles = async () => {
  try {
    isLoading.value = true;
    // 真实分页请求（需后端支持）
    const result = await findAllArticlesByCNService({
      categoryName: currentCategory.value,
      page: loadSize,
      pageSize: currentPage.value
    });
    // 合并新旧数据
    articleAndUser.value = [
      ...articleAndUser.value,
      ...result.data
    ];
    // 页码递增
    currentPage.value += 1;
    // 判断是否还有更多数据（根据接口返回字段调整）
    hasMore.value = result.data.length >= loadSize;
    // 在数据有效时递增页码
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    isLoading.value = false;
  }
};





// 滚动加载
// 修改后的滚动处理函数
const handleScroll = () => {
  if (isLoading.value || !hasMore.value) return;
  const {scrollTop, clientHeight, scrollHeight} = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 300) {
    loadMoreArticles();
  }
}

// 事件监听
onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));

// 修改分类切换方法
const changeCategory = async (category) => {
  // 重置状态
  currentPage.value = 1;
  articleAndUser.value = [];
  hasMore.value = true;
  // 加载新分类数据
  currentCategory.value = category;
  await loadMoreArticles();
  // 路由更新
  await router.push({query: {...route.query, paramName: category}});
};


</script>

<template>
  <div class="container">
    <!-- 导航条 -->
    <div class="nav-bar">
      <button
          v-for="category in categories"
          :key="category"
          :class="{ active: currentCategory === category.categoryName }"
          @click="changeCategory(category.categoryName)"
      >
        {{ category.categoryName }}
      </button>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <div
          v-for="(article, index) in articleAndUser"
          :key="index"
          class="article-card"
      >
        <div class="content-wrapper">
          <!-- 作者信息 -->
          <div class="author-info">
            <img
                :src="article.userPic"
                alt="avatar"
                class="avatar"
            >
            <span v-if="article.username != null" class="username">{{ article.nickname || article.username }}</span>
          </div>

          <!-- 主内容区 -->
          <div class="main-content">
            <!-- 文字内容 -->
            <div class="text-content">
<!--              <h4 class="title">{{ article.title }}</h4>-->
              <div>
                <a :href="(typeof window !== 'undefined' ? window.location.origin : '') + '/article/details/' + article.id"
                   target="_blank"
                   class="title">
                  {{ article.title }}
                </a>
              </div>
              <p class="content" v-html="truncateContent(article.content , 100)"></p>
              <div class="action-bar">
                <div class="action-item">
                  <span class="icon">发布时间: </span>
                  {{ formatTime(article.updateTime) }}
                </div>
                <div class="action-item">
                  <span class="icon">👍</span>
                  {{ article.number }}
                </div>
                <div class="action-item">
<!--                  <span class="icon">评论</span>-->
                  <el-icon ><ChatDotSquare /></el-icon>
                  {{ article.commentCount }}
                </div>
              </div>
            </div>

            <!-- 封面图片 -->
            <img
                :src="article.coverImg"
                alt="cover"
                class="cover-image"
            >
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="loading">
        <div class="loader"></div>
        正在加载更多...
      </div>
      <div v-if="!hasMore && !isLoading" class="no-more">
        没有更多内容了~
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h3 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 1.5rem;
}

.nav-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
}

.nav-bar button {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
  font-size: 0.9rem;
}

.nav-bar button.active {
  background: #2196F3;
  color: white;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s ease;
}

.article-card:hover {
  transform: scale(1.03); /* 当鼠标悬停时放大图片 */
  //transform: translateY(-2px);
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  color: #666;
  font-size: 0.85rem;
}

.main-content {
  display: flex;
  gap: 20px;
}

.text-content {
  flex: 1;
  min-width: 0;
}

.title {
  color: #333;
  margin: 0 0 8px;
  font-size: 1.1rem;
  line-height: 1.4;
  font-weight: 600;
  text-decoration: none; /* 确保默认没有下划线 */
}

.title:hover {
  color: #007BFF; /* 浅蓝色颜色 */
  text-decoration: none; /* 鼠标悬停时去掉下划线 */
}

.content {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-bottom: 12px;
}

.cover-image {
  width: 160px;
  height: 120px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.action-bar {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.85rem;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}

.no-more {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 0.9em;
}

.loader {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #f3f3f3;
  border-radius: 50%;
  border-top-color: #2196F3;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}




</style>