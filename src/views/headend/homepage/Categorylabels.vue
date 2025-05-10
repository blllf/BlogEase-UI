<script setup>
import {ref, computed, nextTick, onMounted} from 'vue';
import {ArrowUp, ArrowDown, Loading} from "@element-plus/icons-vue";
import Headlines from "./Headlines.vue";
import TabsVue from "./TabsVue.vue";
import {articleCategoryListService2} from "../../../api/article.js"
import router from "@/router/indexs.js";
const categories = ref([
  {
    id: 3,
    categoryName: '美食',
    categoryAlias: 'my',
    createTime: '2023-09-02 12:06:59',
    updateTime: '2023-09-02 12:06:59',
    categoryPic: '',
    createUser: ''
  },
])
const loading = ref(true); // 加载状态，默认为 true
// 子组件加载完成计数器
let loadedComponentsCount = 0;
const totalComponents = 1; // 总共有两个子组件需要加载
//显示文章分类数据
const CategoryList = async () => {
  try {
    const result = await articleCategoryListService2();
    // 假设返回的数据结构是 { data: Array }, 并且每个对象都有categoryName字段
    categories.value = result.data.map(item => ({
      title: item.categoryName, // 使用 categoryName 作为 title
      ...item // 可选：保留其他属性
    }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  } finally {
    loading.value = false;
  }
  //findAllArticles()
  //await selectAll(tableDataPage.value , tableDatapageSize.value)
};


onMounted(() => {
  CategoryList(); // 组件挂载时获取分类数据
});

// 子组件加载完成时调用
const onComponentLoaded = () => {
  loadedComponentsCount++;
  console.log("loadedComponentsCount" , loadedComponentsCount)
  if (loadedComponentsCount === totalComponents) {
    loading.value = false; // 所有组件加载完成，关闭加载状态
  }
};

const isExpanded = ref(false);
const ROW_SIZE = 20; // 每行显示的分类数量
const visibleCategories = computed(() => {
  return isExpanded.value ? categories.value : categories.value.slice(0, ROW_SIZE);
});

function toggleCategories() {
  isExpanded.value = !isExpanded.value;
}
const openInNewTab = (categoryId, paramValue) => {
  // 创建你想要导航到的路径和查询参数
  const path = `/article/category/${categoryId}`;
  const queryParams = { paramName: paramValue }; // 替换为你实际需要传递的参数名和值
  const routeData = router.resolve({ path: path, query: queryParams });
  // 在新的标签页打开URL
  window.open(routeData.href, '_blank');
}

</script>

<template>
  <div class="head-tabs">
    <!-- 加载动画 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else class="category-container">
      <el-card class="category-card" shadow="hover" >
        <div class="grid-container" :class="{ 'expanded-content': isExpanded }">
          <span v-for="(category, index) in visibleCategories" :key="index" class="category-title">
<!--            <router-link :to=" `/category/${category.id}` " class="router-link-categorylabels">{{category.categoryName}}</router-link>-->
            <a
                :href="`/article/category/${category.id}?paramName=${category.categoryName}`"
                target="_blank"
                @click.prevent="openInNewTab(category.id, category.categoryName)"
                class="router-link-categorylabels"
            >
              {{category.categoryName}}
            </a>
          </span>
        </div>
        <button v-if="isExpanded === true" @click="toggleCategories" class="expand-button">
          <span class="arrow-icon"><el-icon><ArrowUp /></el-icon></span>
        </button>
        <button v-else @click="toggleCategories" class="expand-button">
          <span class="arrow-icon"><el-icon><ArrowDown /></el-icon></span>
        </button>
      </el-card>
    </div>
    <Headlines @loaded="onComponentLoaded" />
  </div>
  <div>
    <div style="background: #fff ;">
      <TabsVue  @loaded="onComponentLoaded"/>
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

.head-tabs {
  background-color: #fafafa; /* 轻微灰色背景 */
  width: 100%;
  //height: 100vh; /* 视口高度 */
}

.category-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 2rem 0;
}

.category-card {
  //background-color: #fff;
  //border: 1px solid #ddd;
  border-radius: 4px;
  //padding: 1rem;
  width: 80%; /* 设置卡片宽度 */
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.router-link-categorylabels {
  color: #666; /* 浅灰色 */
  font-size: 16px; /* 根据需要调整 */
  letter-spacing: 0.5px;
  /* 确保链接不会换行 */
  white-space: nowrap;
  /* 设置过渡效果，使得颜色变化更加平滑 */
  transition: color 0.3s ease;
  text-decoration: none;
}
/* 当鼠标悬停在链接上时，字体颜色变为黑色 */
.router-link-categorylabels:hover {
  color: #000; /* 黑色 */
  text-decoration: none; /* 鼠标悬停时显示下划线 */
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(20, 1fr); /* 每行20个 */
  gap: 0.5rem; /* 根据需要调整间距 */
  transition: max-height 0.3s ease-in-out;
  overflow: hidden;
}

.category-title {
  white-space: nowrap;
  font-weight: normal;
  text-align: center;
  padding: 0.5rem;
  //background-color: #f9f9f9;
  //border: 1px solid #ddd;
  border-radius: 4px;
}

/* 默认状态下只显示一行 */
.grid-container {
  max-height: calc(1.5rem * 2 + 0.5rem * 2); /* 计算单行高度 */
}

.expanded-content {
  max-height: 1000px; /* 足够大的值以包含所有内容 */
}

.expand-button {
  position: absolute;
  bottom: 1px; /* 调整到接近卡片下划线 */
  left: 50%;
  transform: translateX(-50%); /* 水平居中 */
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.875rem; /* 更紧凑的字体大小 */
  color: #333;
  z-index: 1; /* 确保按钮在其他元素之上 */
}

.arrow-icon {
  line-height: 1; /* 确保符号垂直居中 */
}

@media (hover: hover) {
  .expand-button:hover {
    color: #007bff; /* 悬停时的颜色变化 */
  }
}
</style>