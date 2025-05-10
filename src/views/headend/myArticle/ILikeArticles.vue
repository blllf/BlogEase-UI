<script lang="ts" setup>
import { ref } from 'vue'
import {deleteArticleByIdService , selectArticleByUserIdService , articleCategoryListService2} from "../../../api/article.js";
import {selectAllUsersService} from "@/api/user.js";
import {ElMessage} from "element-plus";
import {Plus, Reading} from "@element-plus/icons-vue";
import { useRoute , useRouter } from 'vue-router';
import {formatTime} from "../../../api/genericFunctions"

const router = useRouter();
const route = useRoute();
const now = new Date()
const userId = ref(route.query.id)
const tableData = ref([
  {
    id: '',
    title: '',
    categoryId: 'Tom',
    createUser: 'California',
    collectionTime: 'Los Angeles',
    content: 'Los Angeles',
  },
])

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

//处理数据用 用户数据模型
const user = ref([
  {
    id: 1 ,
    username: '',
    password: '',
    nickname: '',
    email: '',
    userPic: '',
    createTime: '',
    updateTime: ''
  }
])

//显示文章数据
const articleCategoryList = async () => {
  const result = await articleCategoryListService2();
  categorys.value = result.data;
  selectAll()
}

//获取到所有用户的数据
const articleByUser = async () => {
  const result = await selectAllUsersService();
  user.value = result.data;
  selectAll()
  //console.log(result.data)
}


//查询所有收藏文章
const selectAll = async () => {
  const result = await selectArticleByUserIdService(userId.value);
  tableData.value = result.data
  //处理数据，分类对应的数字转换为具体的分类名字
  for (let i = 0; i < tableData.value.length; i++) {
    let article = tableData.value[i];
    for (let j = 0; j < categorys.value.length; j++) {
      if (article.categoryId == categorys.value[j].id){
        article.categoryName = categorys.value[j].categoryName;
      }
    }
  }

  //处理数据，分类对应的数字转换为具体的用户的名字名字
  for (let i = 0; i < tableData.value.length; i++) {
    let article = tableData.value[i];
    for (let j = 0; j < user.value.length; j++) {
      if (article.createUser == user.value[j].id){
        article.createUser = user.value[j].username;
      }
    }
  }


}

articleByUser()
articleCategoryList()
selectAll()


//移除收藏文章
const remove = async (row) => {
  const result = await deleteArticleByIdService(row.id)
  ElMessage.success(result.message ? result.message : "移除成功")
  selectAll()
}

//查询文章
const readArticleVisible = ref(false)


</script>


<template>
  <div class="article-list-container">
    <el-scrollbar class="collection-article-scrollbar">
      <div v-if="tableData.length === 0">
        <el-empty description="没有数据" />
      </div>
      <ul class="custom-list">
        <li v-for="item in tableData" :key="item.id" class="list-item card">
          <div class="card-content">
            <div class="card-header">
              <span class="category-tag">[博客]</span>
              <a
                  :href="(typeof window !== 'undefined' ? window.location.origin : '') + '/article/details/' + item.id"
                  target="_blank"
                  class="title-link"
              >
                {{ item.title }}
              </a>
            </div>
            <div class="card-footer">
              <span class="collection-time">{{ formatTime(item.collectionTime) }}</span>
            </div>
          </div>
        </li>
      </ul>
    </el-scrollbar>
  </div>

</template>

<style>

.article-list-container {
  max-width: none; /* 移除最大宽度限制 */
  margin: 0; /* 移除居中对齐 */
  //padding: 20px; /* 保留内边距 */
}
.collection-article-scrollbar {
  height: 60vh; /* 根据视口高度设置内容区域高度 */
  border-top: 1px solid #ddd;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  background-color: #fff;
  padding: 20px;
}

/* 滚动条美化 */
.collection-article-scrollbar /deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
}

.collection-article-scrollbar /deep/ .el-scrollbar__thumb {
  background-color: #aaa;
  border-radius: 4px;
}
.custom-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.list-item.card {
  background-color: #ffffff; /* 卡片背景色 */
  border: 1px solid #ebeef5; /* 边框 */
  border-radius: 12px; /* 圆角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); /* 微弱阴影 */
  margin-bottom: 15px; /* 行间距 */
  transition: transform 0.2s ease, box-shadow 0.2s ease; /* 悬停动画 */
  overflow: hidden; /* 防止内容溢出 */
}

.list-item.card:hover {
  transform: translateY(-4px); /* 悬停时轻微上移 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1); /* 加深阴影 */
}

.card-content {
  padding: 15px; /* 内边距 */
}

.card-header {
  display: flex;
  flex-direction: column; /* 改为纵向排列 */
  align-items: flex-start; /* 左对齐 */
  margin-bottom: 10px;
}

.category-tag {
  color: #e6a23c;
  font-size: 14px;
  font-weight: bold;
  background-color: #fdf6ec; /* 背景色与主题色搭配 */
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px; /* 增加间距 */
}

.title-link {
  text-decoration: none;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
  transition: color 0.2s ease;
  text-align: left; /* 左对齐 */
}

.title-link:hover {
  color: #e6a23c; /* 悬停时变色 */
}

.card-footer {
  display: flex;
  justify-content: flex-start; /* 时间靠左对齐 */
  margin-top: 10px;
}

.collection-time {
  font-size: 13px;
  color: #8c939d;
  font-style: italic;
  text-align: left; /* 左对齐 */
}
</style>