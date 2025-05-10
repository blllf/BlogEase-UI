<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute , useRouter } from 'vue-router';
import {indexSearch} from '../../../api/article.js'
import {ElScrollbar} from "element-plus";
import {Select,Message,Share} from '@element-plus/icons-vue'

const router = useRoute();// 用于读取当前路由信息
const router1 = useRouter(); // 用于编程式导航
const size = ref(100)
const page = ref(1)
const total = ref(120)
const articles = ref([])

//格式化数据
const cleanContent = (content) => {
  if (!content) return '';
  // 创建一个临时的DOM容器来解析HTML
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = content;
  // 移除所有的 <h*> 标签并将其内容包裹在 <p> 标签中
  [...tempContainer.querySelectorAll('h1, h2, h3, h4, h5, h6')].forEach(el => {
    const pElement = document.createElement('p');
    pElement.textContent = el.textContent;
    el.replaceWith(pElement);
  });
  // 移除所有 <br> 和 <img> 标签
  [...tempContainer.querySelectorAll('br, img')].forEach(tag => tag.remove());
  // 去除多余的空白字符和换行符
  tempContainer.innerHTML = tempContainer.innerHTML.replace(/\s+/g, ' ').trim();
  // 返回清理后的HTML字符串
  return tempContainer.innerHTML;
};


// 定义一个方法来根据查询参数获取数据
const fetchData = async () => {
  // 使用 searchQueryParams 更新路由查询参数 q
  await router1.push({
    query: {
      ...router.query,
      q: searchQueryParams.value ? searchQueryParams.value : undefined,
      date: timeRange.value ? timeRange.value : 'default'
    }
  });
  const queryParams = router.query.q;
  const categoryParams = router.query.c;
  if (queryParams) {
    try {
      let searchParams = {
        page: page.value,
        size: size.value,
        updateTime: timeRange.value ? timeRange.value : '',
        categoryId: categoryParams ? categoryParams : null,
        key: queryParams ? queryParams : null
      }
      let result = await indexSearch(searchParams);
      total.value = result.data.total
      articles.value = result.data.items.map(article => ({
        ...article,
        content: cleanContent(article.content)
      }));
      //articles.value = result.data.items
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }
};


// 组件挂载后立即读取查询参数并获取数据
onMounted(fetchData);

// 监听路由变化，保持 searchQueryParams 和路由参数同步
watch(
    () => router.query,
    async (newQuery, oldQuery) => {
      // 如果 q 参数发生变化，则同步 searchQueryParams 并重新获取数据
      if (newQuery.q !== oldQuery.q) {
        searchQueryParams.value = newQuery.q || '';
        await fetchData();
      }
    },
    { deep: true }
);

//搜索框
// 定义响应式数据
const searchQueryParams = ref(router.query.q || '');
const showTimeOptions = ref(false);
const timeRange = ref('');

// 方法定义
const toggleTimeOptions = () => {
  showTimeOptions.value = !showTimeOptions.value;
};

const handleTimeChange = (value) => {
  console.log(`Selected time range: ${value}`);
  // 隐藏选项
  //showTimeOptions.value = false;
};




</script>

<template>
  <div class="es-container">
    <el-card class="es-box-card" shadow="always">
      <div class="es-card-header">
        <form @submit.prevent="fetchData" class="search-form">
          <input
              type="text"
              placeholder="搜索..."
              v-model="searchQueryParams"
              class="search-input"
              @keyup.enter="fetchData"
          />
          <button type="submit" class="search-button">
            搜索
          </button>
        </form>
        <el-button type="primary" @click="toggleTimeOptions">筛选</el-button>
      </div>
      <div v-if="showTimeOptions" class="time-options">
        <el-radio-group v-model="timeRange" @change="handleTimeChange">
          <el-radio label="">不限</el-radio>
          <el-radio label="week">一周内</el-radio>
          <el-radio label="month">一月内</el-radio>
          <el-radio label="threeMonths">三月内</el-radio>
          <el-radio label="year">一年内</el-radio>
        </el-radio-group>
      </div>
    </el-card>
  </div>



  <div>
    <el-scrollbar>
      <div class="article-container">
        <article class="article-list">
          <div v-for="(item, index) in articles" :key="index" class="article-item">
            <header class="article-header">
              <router-link :to="`/article/details/${item.id}`" class="article-title">
                <span v-html="item.title"></span>
              </router-link>
            </header>
            <div class="article-content" v-html="item.content"></div>
            <footer class="article-footer">
              <div class="icons-left">
                <!-- 假设有三个图标 -->
                <el-icon><Select /></el-icon>
                <el-icon><Message /></el-icon>
                <el-icon><Share /></el-icon>
              </div>
              <div class="meta-right">
                <div class="meta-info">
                  <span>{{ item.username }}</span> •
                  <span class="time">{{ item.updateTime }}</span>
                </div>
              </div>
            </footer>
            <hr class="article-divider" v-if="index !== articles.length - 1">
          </div>
        </article>
        <footer class="custom-footer">没有更多了...</footer>
      </div>
    </el-scrollbar>
  </div>

</template>

<style scoped>
.es-container {
  width: 80%; /* 占据页面80%宽度 */
  margin: auto; /* 居中 */
  padding-top: 20px; /* 上方留出一些空间 */
}

.es-box-card {
  width: 100%; /* 卡片占据容器的全部宽度 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加轻微的阴影 */
  border-radius: 8px; /* 圆角 */
}

.es-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  //padding: 15px;
}

.search-form {
  display: flex;
  align-items: center;
}

.search-input {
  width: 500px; /* 固定宽度 */
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px 0 0 4px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #0D47A1;
  box-shadow: 0 0 5px rgba(64, 158, 255, 0.5);
}

.search-button {
  padding: 10px 20px;
  background-color: #6495ED;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #0B3D91;
}

.time-options {
  padding: 10px;
  border-top: 1px solid #e0e0e0;
}



.article-container {
  width: 80%;
  margin: auto;
  padding: 20px;
}

.article-list {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 15px;
  overflow: hidden;
}

.article-item {
  /* 确保每个文章项紧凑排列 */
  margin-bottom: 15px; /* 每篇文章之间的间距 */
}

.article-header,
.article-content {
  /* 确保标题和内容都靠左对齐 */
  margin: 0;
  padding: 0;
}

.article-title {
  font-size: 1.1em; /* 调整标题字体大小 */
  font-weight: normal; /* 标题不加粗 */
  color: #333; /* 标题颜色保持较深 */
  white-space: nowrap;
  text-decoration: none;
  transition: color 0.3s ease;
  display: inline-block; /* 改为inline-block以适应文本宽度 */
  margin-bottom: 5px; /* 标题与内容之间的间距 */
}

/* 添加一个内部span来包裹文本 */
.article-title > span {
  display: inline-block;
}

.article-title > span:hover {
  color: #6495ED;
}

.article-content {
  white-space: pre-line; /* 确保换行符生效 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* 只显示两行 */
  overflow: hidden;
  text-overflow: ellipsis; /* 超出部分用省略号表示 */
  margin-bottom: 10px; /* 内容与底部信息之间的间距 */
  color: #777; /* 正文颜色设置为较淡的颜色 */
  font-size: 0.95em; /* 可选：调整正文的字体大小 */
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  color: #777;
}

.icons-left {
  display: flex;
  gap: 10px;
}

.meta-info {
  display: inline-block;
}

.time {
  margin-left: 5px;
}

.article-divider {
  border: 0;
  height: 1px;
  background-color: #e0e0e0;
  margin: 10px 0;
}

.custom-footer {
  text-align: center;
  margin-top: 20px;
  color: #aaa;
}
/* 使用深度选择器 */
:deep(em) {
  color:  #6495ED;
  font-style: normal;
}
</style>