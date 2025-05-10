<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import {selectAllArticles2} from '../../../api/article.js'
import {truncateContent} from '../../../api/genericFunctions.js'
import AttentionVue from "@/views/headend/homepage/Attention.vue";
import RankingVue from "@/views/headend/homepage/Ranking.vue";
import { useRoute, useRouter  } from 'vue-router';
// 定义当前选中的标签
const activeTab = ref('recommend');

// 切换标签的方法
const switchTab = (tab) => {
  activeTab.value = tab;
};

// 文章数据
const articles = ref([]);

// 是否正在加载更多的标志
const isLoadingMore = ref(false);
// 获取推荐标签页的文章列表容器引用
const articlesContainer = ref(null);
// 分页状态
const currentPage = ref(0);
const pageSize = ref(10);
const route = useRoute();// 获取当前路由对象
const router = useRouter();
// 模拟加载更多文章的数据函数
const loadMoreArticles = async () => {
  if (isLoadingMore.value || activeTab.value !== 'recommend') return;
  isLoadingMore.value = true;
  let params = {
    page: currentPage.value,//tableDataPage.value,
    size: pageSize.value
  }
  try {
    const response = await selectAllArticles2(params);
    // 检查 response.data 是否存在且不为空
    if (!response.data || response.data.length === 0) {
      // 使用非阻塞的通知方式告知用户没有更多内容可加载
      alert('已经到达最后一页，没有更多文章了。'); // 不推荐使用 alert()
      return;
    }
    articles.value = [...articles.value, ...response.data];
    currentPage.value += 10; // 加载成功后，增加当前页数
  } catch (error){
    console.error('Failed to load more articles:', error);
  } finally {
    isLoadingMore.value = false;
  }
  // 模拟网络延迟
  //await new Promise(resolve => setTimeout(resolve, 1000));
};

// 监听滚动事件
const handleScroll = () => {
  if (activeTab.value !== 'recommend') return;
  const container = articlesContainer.value;
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  // 当“推荐”标签页的内容接近视口底部一定距离时加载更多
  if (!isLoadingMore.value && rect.bottom - viewportHeight < 200) {
    loadMoreArticles();
  }
};


onMounted(() => {
  loadMoreArticles();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// 使用watch监听activeTab的变化，以便在切换标签页时重置滚动位置
watch(activeTab, (newVal) => {
  if (newVal === 'recommend' && articlesContainer.value) {
    // 如果切换到"推荐"标签页，则滚动到顶部
    articlesContainer.value.scrollTop = 0;
  }
}, { immediate: true });

const navigateToAuthorPage = (username , id) => {
   const resolved = router.resolve({
   path: '/article/peopleCentral',
   query: {p: username , id: id}
 });
 // 使用window.open在新标签页中打开链接
 window.open(resolved.href, '_blank');
};

</script>

<template>
  <div class="main-container">
    <!-- 左侧内容区域（标签栏+内容） -->
    <div class="content-wrapper">
      <!-- 标签栏 -->
      <div class="tabs">
        <button
            :class="['tab-button', { active: activeTab === 'follow' }]"
            @click="switchTab('follow')"
        >
          关注
        </button>
        <button
            :class="['tab-button', { active: activeTab === 'recommend' }]"
            @click="switchTab('recommend')"
        >
          推荐
        </button>
      </div>

      <!-- 内容区 -->
      <div v-if="activeTab === 'follow'" class="tab-content">
        <AttentionVue/>
      </div>
      <div v-else-if="activeTab === 'recommend'" class="tab-content">
        <div class="articles-list" ref="articlesContainer">
          <div v-for="(item, index) in articles" :key="index" class="article-item">
            <img :src="item.coverImg" alt="Article Image" class="article-image">
            <div class="article-details">
              <span class="article-title">
<!--                <router-link :to=" `/article/details/${item.id}` " class="router-link-tabsvue"> {{ item.title }}</router-link>-->
                <a :href="(typeof window !== 'undefined' ? window.location.origin : '') + '/article/details/' + item.id"
                   target="_blank"
                   class="router-link-tabsvue">
                  {{ item.title }}
                </a>
              </span>
              <p class="article-content" v-html="truncateContent(item.content , 100)"></p>
<!--              <span class="article-author">作者：{{ item.username }}</span>-->
              <span
                  class="article-author"
                  @click="navigateToAuthorPage(item.username , item.createUser)"
              >
                  作者：{{ item.username }}
              </span>
            </div>
          </div>
        </div>
        <!-- 加载指示器 -->
        <div v-if="isLoadingMore" class="loading-indicator">加载中...</div>
      </div>
    </div>

    <!-- 右侧卡片展示 -->
    <div class="sidebar-card">
      <el-affix>
        <RankingVue/>
      </el-affix>
    </div>



  </div>
</template>

<style scoped>

.main-container {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 确保内容顶部对齐 */
  width: 80%; /* 整体布局占据页面宽度的80% */
  margin: 0 auto; /* 居中显示 */
}

.content-wrapper {
  flex: 7; /* 占据70%的空间 */
  padding-right: 1rem; /* 与右侧卡片之间留出间距 */
  /*flex: 1; !* 让内容区域自动扩展填充剩余空间 *!
  margin-right: 32%; !* 根据侧边栏宽度调整此值，略大于侧边栏的宽度以避免重叠 *!*/
}

.tabs {
  display: flex;
  border-bottom: 2px solid #ddd;
  margin-bottom: 1rem;
  gap: 0.5rem; /* 标签之间的间距 */
  overflow-x: auto; /* 允许水平滚动 */
  flex-wrap: nowrap; /* 防止标签换行 */
}

.tab-button {
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  color: #666;
  text-align: center;
  flex-shrink: 0; /* 防止标签缩小 */
  white-space: nowrap; /* 防止文本换行 */
}

.tab-button.active {
  color: #007bff;
  border-bottom: 3px solid #007bff;
}

.tab-button:hover {
  color: #0056b3;
}

.tab-content {
  padding: 1rem;
  //background-color: #f9f9f9;
  border-radius: 4px;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 文章项之间的间距 */
}

/* 移除文章项的边框 */
.article-item {
  display: flex;
  background-color: #fff;
  border-radius: 4px;
  padding: 1rem;
  gap: 1rem; /* 图片与文字之间的间距 */
  border-bottom: 1px solid #ddd; /* 添加底部边界作为分隔线 */
}

/* 去除最后一项的下划线 */
.articles-list > .article-item:last-child {
  border-bottom: none;
}

/* 当鼠标悬停在文章项上时更改背景颜色以提供反馈 */
.article-item:hover {
  background-color: #fafafa;
}


.article-image {
  width: 180px ; /* 设置图片宽度 */
  height: auto; /* 保持图片比例 */
  border-radius: 4px;
  transition: transform 0.5s ease; /* 添加过渡效果 */
}

.article-image:hover {
  transform: scale(1.10); /* 当鼠标悬停时放大图片 */
}

.article-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.article-title {
  font-size: 1.1rem;
  margin: 0;
  color: black;
}

.article-content {
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0;
}

.article-author {
  font-size: 0.9rem;
  color: #999;
  cursor: pointer; /* 鼠标变为手型 */
  transition: all 0.3s ease; /* 添加平滑过渡效果 */
}

.article-author:hover {
  color: #007bff; /* 悬停时改变颜色 */
  text-decoration: underline; /* 添加下划线 */
}



.sidebar-card {
  //position: fixed;
  right: 20px; /* 距离页面右边的距离 */
  width: 27%; /* 设置宽度为30%，替代原来的flex: 3; */
  background-color: #fff;
  border-radius: 10px;
  padding: 1rem;
}

/* 添加样式给加载指示器 */
.loading-indicator {
  text-align: center;
  padding: 1rem;
  font-size: 1rem;
}
.router-link-tabsvue {
  /*color: #2c3e50;
  !* 确保链接不会换行 *!
  white-space: nowrap;
  !* 设置过渡效果，使得颜色变化更加平滑 *!
  transition: color 0.3s ease;
  text-decoration: none;*/
  color: #2c3e50;
  font-weight: normal;
  transition: color 0.3s ease;
  text-decoration: none;
}

.router-link-tabsvue:hover {
  text-decoration: underline; /* 鼠标悬停时显示下划线 */
}





</style>