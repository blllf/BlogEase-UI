<script setup>
import {onMounted, ref} from 'vue';
import {deleteArticleService, findPersonalCenterEssay} from '../../../api/article.js'
import {truncateContent, truncateTitle} from "@/api/genericFunctions.js";
import {ElMessage, ElMessageBox} from "element-plus";
import { useRoute , useRouter } from 'vue-router';
import {userInfoStore} from "@/stores/userInfo.js";


const infoStore = userInfoStore();
const router = useRouter();
const route = useRoute();
const articleData = ref();
const createUser = ref(1)
const deleted = ref(0)
const isShow = ref(false)

onMounted(async () => {
  await getArticleData();
  show();
})

const userId = ref(route.query.id)

const show = () => {
  isShow.value = String(userId.value) === String(infoStore.info.id);
}
const getArticleData = async () => {
  const params = {
    createUser: userId.value,
    deleted: deleted.value
  }
  const result = await findPersonalCenterEssay(params);
  articleData.value = result.data
}

const editArticle = (id) => {
  const url = window.location.origin + '/my_blog/creation/' + id;
  window.open(url , '_blank');
}
const deleteArticle = (id) => {
  ElMessageBox.confirm(
      '你确认要删除该文章吗',
      '温馨提示',
      {confirmButtonText : '确认', cancelButtonText : '取消', type:'warning'}
  ).then(async () => {
        //调用删除接口
        const result = await deleteArticleService(id);
        ElMessage({type: 'success', message: '删除成功',})
        await getArticleData();
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: '用户取消了删除',
        })
      })
}

</script>

<template>
  <div class="article-list">
    <el-scrollbar class="article-scrollbar">
      <div v-for="(article, index) in articleData" :key="index" class="article-item">
        <div class="resource-article-image">
          <img :src="article.coverImg" alt="Article Image">
        </div>
        <div class="article-content">
          <a :href="(typeof window !== 'undefined' ? window.location.origin : '') + '/article/details/' + article.id"
             target="_blank"
             class="router-link-ranking">
            {{ truncateTitle(article.title , 30) }}
          </a>
          <p v-html="truncateContent(article.content, 70)"></p>
          <div class="article-meta">
            <span>发布博客 {{ article.updateTime }} · </span>
            <span>{{ article.number }} 点赞 · </span>
            <span>{{ article.commentCount }} 评论 · </span>
            <span>{{ article.collectionCount }} 收藏</span>

            <!-- 编辑和删除按钮 -->
            <div v-if="isShow" class="action-buttons">
              <span class="edit-btn" @click="editArticle(article.id)">编辑</span>
              <span class="delete-btn" @click="deleteArticle(article.id)">删除</span>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.article-list {
  display: flex;
  flex-direction: column;
}

.article-item {
  display: flex;
  margin-bottom: 10px; /* 减少间距 */
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px; /* 减少间距 */
  position: relative; /* 添加相对定位，用于控制按钮位置 */
}

.resource-article-image {
  flex: 0 0 120px; /* 缩小图片宽度 */
  margin-right: 10px; /* 减少间距 */
}

.resource-article-image img {
  width: 100%; /* 图片宽度占满容器 */
  height: 80px; /* 自动调整高度 */
  //max-height: 100px; /* 限制图片最大高度 */
  object-fit: cover; /* 确保图片完整显示，避免拉伸或裁剪 */
  border-radius: 4px; /* 添加圆角效果 */
}

.article-content {
  flex: 1;
}

.article-content h2 {
  font-size: 16px; /* 缩小标题字体 */
  margin: 0 0 5px; /* 减少标题上下间距 */
}

.article-content p {
  font-size: 12px; /* 缩小描述字体 */
  margin: 0 0 5px; /* 减少描述上下间距 */
  color: #666; /* 使用灰色文字 */
}

.article-meta {
  display: flex;
  gap: 8px; /* 减少元数据间距 */
  font-size: 12px; /* 缩小元数据字体 */
  color: #999; /* 使用浅灰色文字 */
}
.action-buttons {
  display: none; /* 默认隐藏按钮 */
  margin-left: 500px;
  gap: 8px; /* 按钮间距 */
}

/* 鼠标悬停时显示按钮 */
.article-item:hover .action-buttons {
  display: flex; /* 显示按钮 */
}

.edit-btn,
.delete-btn {
  cursor: pointer; /* 鼠标悬停时显示为手型 */
  color: #007bff; /* 蓝色文字 */
  font-size: 12px; /* 字体大小 */
}

.edit-btn:hover,
.delete-btn:hover {
  text-decoration: underline; /* 鼠标悬停时添加下划线 */
}
</style>